import { Phone, MapPin } from "lucide-react";
import { CONTACTS, usePhoneCopy } from "../contacts";

// Phones: contact list in the Messenger style
export function ContactsList() {
  const { copied, copy } = usePhoneCopy();

  return (
    <div className="msn-body px-2 py-3">
      <h3 className="wlm-group px-3">
        Get in touch <span>(5)</span>
      </h3>
      <ul className="mt-1">
        {CONTACTS.map((contact) => (
          <li key={contact.name}>
            <a
              href={contact.href}
              target={contact.href.startsWith("http") ? "_blank" : undefined}
              rel="noreferrer"
              className="wlm-row items-center"
            >
              <span className="tile h-9 w-9" style={{ backgroundColor: contact.color }}>
                <contact.icon className="h-4 w-4" aria-hidden="true" />
              </span>
              <span className="min-w-0">
                <span className="block font-semibold text-[var(--ink)]">{contact.name}</span>
                <span className="block truncate text-sm text-[var(--ink-soft)]">
                  {contact.detail}
                </span>
              </span>
            </a>
          </li>
        ))}
        <li>
          <button type="button" className="wlm-row" onClick={copy}>
            <span className="tile h-9 w-9" style={{ backgroundColor: "#138a8a" }}>
              <Phone className="h-4 w-4" aria-hidden="true" />
            </span>
            <span className="min-w-0 text-left">
              <span className="block font-semibold text-[var(--ink)]">Phone</span>
              <span className="block text-sm text-[var(--ink-soft)]" aria-live="polite">
                {copied ? "Number copied" : "Copy my number"}
              </span>
            </span>
          </button>
        </li>
        <li className="wlm-row items-center">
          <span className="tile h-9 w-9" style={{ backgroundColor: "#c46a12" }}>
            <MapPin className="h-4 w-4" aria-hidden="true" />
          </span>
          <span>
            <span className="block font-semibold text-[var(--ink)]">Location</span>
            <span className="block text-sm text-[var(--ink-soft)]">San Francisco, CA</span>
          </span>
        </li>
      </ul>
    </div>
  );
}
