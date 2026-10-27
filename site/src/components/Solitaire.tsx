import { useEffect, useRef, useState } from "react";
import type { PointerEvent as ReactPointerEvent } from "react";
import "@fontsource/silkscreen/400.css";
import "@fontsource/silkscreen/700.css";

type Suit = "spades" | "hearts" | "diamonds" | "clubs";

type Card = { id: string; suit: Suit; rank: number; faceUp: boolean };

type Game = {
  stock: Card[];
  waste: Card[];
  foundations: Card[][];
  tableau: Card[][];
  moves: number;
};

type Source =
  | { kind: "waste" }
  | { kind: "foundation"; index: number }
  | { kind: "tableau"; index: number; from: number };

type Target = { kind: "foundation"; index: number } | { kind: "tableau"; index: number };

type Drag = { source: Source; cards: Card[]; x: number; y: number };

const SUITS: Suit[] = ["spades", "hearts", "diamonds", "clubs"];
const RANKS = ["", "A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];
const RANK_NAMES = ["", "Ace", "2", "3", "4", "5", "6", "7", "8", "9", "10", "Jack", "Queen", "King"];

const isRed = (suit: Suit) => suit === "hearts" || suit === "diamonds";
const cardName = (card: Card) => `${RANK_NAMES[card.rank]} of ${card.suit}`;

function deal(): Game {
  const deck: Card[] = SUITS.flatMap((suit) =>
    Array.from({ length: 13 }, (_, i) => ({ id: `${suit}-${i + 1}`, suit, rank: i + 1, faceUp: false }))
  );
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  const tableau = Array.from({ length: 7 }, (_, i) => {
    const pile = deck.splice(0, i + 1);
    pile[pile.length - 1].faceUp = true;
    return pile;
  });
  return { stock: deck, waste: [], foundations: [[], [], [], []], tableau, moves: 0 };
}

const cardsAt = (g: Game, source: Source): Card[] => {
  if (source.kind === "waste") return g.waste.slice(-1);
  if (source.kind === "foundation") return g.foundations[source.index].slice(-1);
  return g.tableau[source.index].slice(source.from);
};

const canDrop = (g: Game, cards: Card[], target: Target): boolean => {
  const card = cards[0];
  if (!card) return false;
  if (target.kind === "foundation") {
    const pile = g.foundations[target.index];
    const top = pile[pile.length - 1];
    return cards.length === 1 && (top ? top.suit === card.suit && card.rank === top.rank + 1 : card.rank === 1);
  }
  const pile = g.tableau[target.index];
  const top = pile[pile.length - 1];
  if (!top) return card.rank === 13;
  return top.faceUp && isRed(top.suit) !== isRed(card.suit) && card.rank === top.rank - 1;
};

const sameSpot = (source: Source, target: Target) =>
  source.kind === target.kind && "index" in source && source.index === target.index;

function applyMove(g: Game, source: Source, target: Target): Game {
  const next: Game = structuredClone(g);
  let moving: Card[];
  if (source.kind === "waste") moving = next.waste.splice(-1);
  else if (source.kind === "foundation") moving = next.foundations[source.index].splice(-1);
  else {
    const pile = next.tableau[source.index];
    moving = pile.splice(source.from);
    const top = pile[pile.length - 1];
    if (top) top.faceUp = true;
  }
  if (target.kind === "foundation") next.foundations[target.index].push(...moving);
  else next.tableau[target.index].push(...moving);
  next.moves += 1;
  return next;
}

// Where a clicked card should go: a foundation first, then any tableau pile that takes it
function bestTarget(g: Game, source: Source): Target | null {
  const cards = cardsAt(g, source);
  if (!cards.length) return null;
  const targets: Target[] = [
    ...(cards.length === 1 ? [0, 1, 2, 3].map((index) => ({ kind: "foundation" as const, index })) : []),
    ...[0, 1, 2, 3, 4, 5, 6].map((index) => ({ kind: "tableau" as const, index })),
  ];
  return (
    targets.find(
      (t) =>
        !sameSpot(source, t) &&
        !(source.kind === "foundation" && t.kind === "foundation") &&
        canDrop(g, cards, t)
    ) ?? null
  );
}

const readTarget = (x: number, y: number): Target | null => {
  for (const el of document.elementsFromPoint(x, y)) {
    const drop = (el as HTMLElement).dataset?.drop;
    if (drop) {
      const [kind, index] = drop.split(":");
      return { kind: kind as Target["kind"], index: Number(index) };
    }
  }
  return null;
};

const formatTime = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

// 9×9 bitmaps, drawn pixel by pixel like the early-90s card faces
const SUIT_PIXELS: Record<Suit, string[]> = {
  hearts: [
    " ##   ## ",
    "#### ####",
    "#########",
    "#########",
    "#########",
    " ####### ",
    "  #####  ",
    "   ###   ",
    "    #    ",
  ],
  diamonds: [
    "    #    ",
    "   ###   ",
    "  #####  ",
    " ####### ",
    "#########",
    " ####### ",
    "  #####  ",
    "   ###   ",
    "    #    ",
  ],
  spades: [
    "    #    ",
    "   ###   ",
    "  #####  ",
    " ####### ",
    "#########",
    "#########",
    " ## # ## ",
    "    #    ",
    "  #####  ",
  ],
  clubs: [
    "   ###   ",
    "  #####  ",
    "   ###   ",
    " ## # ## ",
    "#########",
    "#########",
    " ## # ## ",
    "    #    ",
    "  #####  ",
  ],
};

function PixelSuit({ suit, className }: { suit: Suit; className?: string }) {
  return (
    <svg
      viewBox="0 0 9 9"
      className={className}
      shapeRendering="crispEdges"
      fill="currentColor"
      aria-hidden="true"
    >
      {SUIT_PIXELS[suit].flatMap((row, y) =>
        [...row].map((px, x) => (px === "#" ? <rect key={`${x}-${y}`} x={x} y={y} width="1" height="1" /> : null))
      )}
    </svg>
  );
}

function CardFace({ card }: { card: Card }) {
  return (
    <>
      <span className="card-corner" aria-hidden="true">
        {RANKS[card.rank]}
        <PixelSuit suit={card.suit} className="card-corner-suit" />
      </span>
      <PixelSuit suit={card.suit} className="card-pip" />
      <span className="card-corner is-bottom" aria-hidden="true">
        {RANKS[card.rank]}
        <PixelSuit suit={card.suit} className="card-corner-suit" />
      </span>
    </>
  );
}

function Solitaire() {
  const [game, setGame] = useState(deal);
  const [history, setHistory] = useState<Game[]>([]);
  const [seconds, setSeconds] = useState(0);
  const [cardW, setCardW] = useState(84);
  const [drag, setDrag] = useState<Drag | null>(null);
  const tableRef = useRef<HTMLDivElement>(null);
  const pending = useRef<{
    source: Source;
    cards: Card[];
    startX: number;
    startY: number;
    offX: number;
    offY: number;
    moved: boolean;
  } | null>(null);

  const won = game.foundations.every((f) => f.length === 13);

  // Cards scale with the window
  useEffect(() => {
    const table = tableRef.current;
    if (!table) return;
    const observer = new ResizeObserver(([entry]) => {
      const width = entry.contentRect.width;
      setCardW(Math.max(44, Math.min(110, Math.floor((width - 32 - 6 * 14) / 7))));
    });
    observer.observe(table);
    return () => observer.disconnect();
  }, []);

  // The clock runs from the first move until the game is won
  useEffect(() => {
    if (game.moves === 0 || won) return;
    const id = window.setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(id);
  }, [game.moves, won]);

  const commit = (next: Game) => {
    setHistory((h) => [...h.slice(-200), game]);
    setGame(next);
  };

  const newGame = () => {
    setGame(deal());
    setHistory([]);
    setSeconds(0);
  };

  const undo = () => {
    const previous = history[history.length - 1];
    if (!previous) return;
    setHistory((h) => h.slice(0, -1));
    setGame(previous);
  };

  const drawFromStock = () => {
    const next: Game = structuredClone(game);
    if (next.stock.length) {
      const card = next.stock.pop()!;
      card.faceUp = true;
      next.waste.push(card);
    } else if (next.waste.length) {
      next.stock = next.waste.reverse().map((c) => ({ ...c, faceUp: false }));
      next.waste = [];
    } else {
      return;
    }
    next.moves += 1;
    commit(next);
  };

  const autoMove = (source: Source) => {
    const target = bestTarget(game, source);
    if (target) commit(applyMove(game, source, target));
  };

  const grab = (source: Source) => ({
    onPointerDown: (e: ReactPointerEvent<HTMLButtonElement>) => {
      if (e.button !== 0) return;
      const rect = e.currentTarget.getBoundingClientRect();
      pending.current = {
        source,
        cards: cardsAt(game, source),
        startX: e.clientX,
        startY: e.clientY,
        offX: e.clientX - rect.left,
        offY: e.clientY - rect.top,
        moved: false,
      };
      e.currentTarget.setPointerCapture(e.pointerId);
    },
    onPointerMove: (e: ReactPointerEvent<HTMLButtonElement>) => {
      const p = pending.current;
      if (!p) return;
      if (!p.moved && Math.hypot(e.clientX - p.startX, e.clientY - p.startY) < 5) return;
      p.moved = true;
      setDrag({ source: p.source, cards: p.cards, x: e.clientX - p.offX, y: e.clientY - p.offY });
    },
    onPointerUp: (e: ReactPointerEvent<HTMLButtonElement>) => {
      const p = pending.current;
      pending.current = null;
      if (!p) return;
      if (!p.moved) {
        autoMove(p.source);
        return;
      }
      setDrag(null);
      const target = readTarget(e.clientX, e.clientY);
      if (target && !sameSpot(p.source, target) && canDrop(game, p.cards, target)) {
        commit(applyMove(game, p.source, target));
      }
    },
    onPointerCancel: () => {
      pending.current = null;
      setDrag(null);
    },
    // Keyboard: Enter or Space sends the card wherever it can go
    onClick: (e: React.MouseEvent) => {
      if (e.detail === 0) autoMove(source);
    },
  });

  const cardH = Math.round(cardW * 1.4);
  const gap = 14;
  const colX = (col: number) => 16 + col * (cardW + gap);
  const rowY = 16 + cardH + 22;
  const downStep = Math.max(6, Math.round(cardH * 0.1));
  const upStep = Math.round(cardH * 0.26);
  const dragging = new Set(drag?.cards.map((c) => c.id));

  const tallest = Math.max(
    ...game.tableau.map((pile) =>
      pile.reduce((y, c, i) => (i === pile.length - 1 ? y : y + (c.faceUp ? upStep : downStep)), 0)
    )
  );

  const style = (x: number, y: number, z = 1) => ({
    left: x,
    top: y,
    width: cardW,
    height: cardH,
    zIndex: z,
    fontSize: Math.max(11, Math.round(cardW * 0.2)),
  });

  const wasteTop = game.waste[game.waste.length - 1];

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="solitaire-menu">
        <button type="button" onClick={newGame}>
          New game
        </button>
        <button type="button" onClick={undo} disabled={!history.length}>
          Undo
        </button>
      </div>

      <div ref={tableRef} className="solitaire-felt has-scrollbar">
        <div className="relative" style={{ height: rowY + tallest + cardH + 24 }}>
          {/* Stock */}
          <button
            type="button"
            className={`card-slot ${game.stock.length ? "card is-back" : "is-recycle"}`}
            style={style(colX(0), 16)}
            onClick={drawFromStock}
            aria-label={game.stock.length ? `Deal a card (${game.stock.length} left)` : "Turn the waste pile back over"}
          />

          {/* Waste */}
          <div className="card-slot" style={style(colX(1), 16, 0)} />
          {wasteTop && (
            <button
              type="button"
              className={`card ${isRed(wasteTop.suit) ? "is-red" : ""}`}
              style={{ ...style(colX(1), 16, 2), visibility: dragging.has(wasteTop.id) ? "hidden" : undefined }}
              aria-label={cardName(wasteTop)}
              {...grab({ kind: "waste" })}
            >
              <CardFace card={wasteTop} />
            </button>
          )}

          {/* Foundations */}
          {game.foundations.map((pile, i) => {
            const top = pile[pile.length - 1];
            return (
              <div key={`f${i}`}>
                <div
                  className="card-slot is-foundation"
                  data-drop={`foundation:${i}`}
                  style={style(colX(3 + i), 16, 0)}
                >
                  A
                </div>
                {top && (
                  <button
                    type="button"
                    data-drop={`foundation:${i}`}
                    className={`card ${isRed(top.suit) ? "is-red" : ""}`}
                    style={{ ...style(colX(3 + i), 16, 2), visibility: dragging.has(top.id) ? "hidden" : undefined }}
                    aria-label={cardName(top)}
                    {...grab({ kind: "foundation", index: i })}
                  >
                    <CardFace card={top} />
                  </button>
                )}
              </div>
            );
          })}

          {/* Tableau */}
          {game.tableau.map((pile, i) => {
            let y = rowY;
            return (
              <div key={`t${i}`}>
                <div className="card-slot" data-drop={`tableau:${i}`} style={style(colX(i), rowY, 0)} />
                {pile.map((card, j) => {
                  const top = y;
                  y += card.faceUp ? upStep : downStep;
                  if (!card.faceUp) {
                    return (
                      <div
                        key={card.id}
                        className="card is-back"
                        data-drop={`tableau:${i}`}
                        style={style(colX(i), top, j + 1)}
                      />
                    );
                  }
                  return (
                    <button
                      key={card.id}
                      type="button"
                      data-drop={`tableau:${i}`}
                      className={`card ${isRed(card.suit) ? "is-red" : ""}`}
                      style={{ ...style(colX(i), top, j + 1), visibility: dragging.has(card.id) ? "hidden" : undefined }}
                      aria-label={cardName(card)}
                      {...grab({ kind: "tableau", index: i, from: j })}
                    >
                      <CardFace card={card} />
                    </button>
                  );
                })}
              </div>
            );
          })}
        </div>

        {won && (
          <div className="solitaire-won" role="status">
            <p className="text-xl font-bold">You won!</p>
            <p className="mt-1 text-sm">
              {game.moves} moves in {formatTime(seconds)}
            </p>
            <button type="button" className="mt-4" onClick={newGame}>
              Play again
            </button>
          </div>
        )}
      </div>

      {drag && (
        <div className="pointer-events-none fixed z-[9999]" style={{ left: drag.x, top: drag.y }}>
          {drag.cards.map((card, i) => (
            <div
              key={card.id}
              className={`card is-dragging ${isRed(card.suit) ? "is-red" : ""}`}
              style={style(0, i * upStep, i + 1)}
            >
              <CardFace card={card} />
            </div>
          ))}
        </div>
      )}

      <div className="status-bar">
        <p className="status-bar-field">Moves: {game.moves}</p>
        <p className="status-bar-field tabular">Time: {formatTime(seconds)}</p>
      </div>
    </div>
  );
}

export default Solitaire;
