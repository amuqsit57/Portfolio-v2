"use client";

import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { profile, experience, featured, archive } from "@/data/profile";
import { useStore, type Section } from "@/store/useStore";
import { sfx } from "@/lib/sfx";

type Line = { t: string; k?: "in" | "sys" | "ok" | "err" };
type Draft = { step: "name" | "email" | "message" | "confirm"; name?: string; email?: string; message?: string };

const HANDSHAKE = [
  "Detecting transceiver ...... SFP+ 10GBASE-SR",
  "Seating connector .......... LC duplex",
  "Negotiating link ........... 10 Gb/s full-duplex",
];

const SECTIONS: Record<string, Section> = {
  cpu: "cpu",
  about: "cpu",
  memory: "memory",
  experience: "memory",
  pcie: "pcie",
  projects: "pcie",
  archive: "storage",
  storage: "storage",
  bios: "bios",
  education: "bios",
};

const PROMPTS: Record<Draft["step"], string> = {
  name: "Your name:",
  email: "Your email:",
  message: "Message (one line, press enter to finish):",
  confirm: "Send this packet? (y/n)",
};

function mailto(subject: string, body: string) {
  return `mailto:${profile.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

export default function TerminalPanel() {
  const plugged = useStore((s) => s.plugged);
  const open = useStore((s) => s.open);
  const close = useStore((s) => s.close);
  const [shake, setShake] = useState(0);
  const [lines, setLines] = useState<Line[]>([]);
  const [value, setValue] = useState("");
  const [draft, setDraft] = useState<Draft | null>(null);
  const [history, setHistory] = useState<string[]>([]);
  const [hIdx, setHIdx] = useState(-1);
  const [copied, setCopied] = useState(false);
  const out = useRef<HTMLDivElement>(null);
  const input = useRef<HTMLInputElement>(null);

  // Handshake lines tick in while the cable travels to the port
  useEffect(() => {
    if (shake >= HANDSHAKE.length) return;
    const id = setTimeout(() => setShake((v) => v + 1), 380);
    return () => clearTimeout(id);
  }, [shake]);

  useEffect(() => {
    if (!plugged) return;
    setLines([
      { t: "LINK UP · session established over fiber", k: "ok" },
      { t: `Connected to ${profile.name.toLowerCase().replace(" ", ".")}@mb-am01` },
      { t: "Type 'help' to list commands, or 'send' to write me a message.", k: "sys" },
    ]);
    setTimeout(() => input.current?.focus({ preventScroll: true }), 50);
  }, [plugged]);

  useEffect(() => {
    out.current?.scrollTo({ top: out.current.scrollHeight });
  }, [lines]);

  const print = (...ls: Line[]) => setLines((l) => [...l, ...ls]);

  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText(profile.email);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
      return true;
    } catch {
      return false;
    }
  };

  const runDraft = (raw: string, d: Draft) => {
    const v = raw.trim();
    if (d.step === "name") {
      if (!v) return print({ t: "Name can't be empty.", k: "err" }, { t: PROMPTS.name, k: "sys" });
      setDraft({ ...d, step: "email", name: v });
      return print({ t: PROMPTS.email, k: "sys" });
    }
    if (d.step === "email") {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) return print({ t: "That doesn't look like an email address.", k: "err" }, { t: PROMPTS.email, k: "sys" });
      setDraft({ ...d, step: "message", email: v });
      return print({ t: PROMPTS.message, k: "sys" });
    }
    if (d.step === "message") {
      if (!v) return print({ t: "Message can't be empty.", k: "err" }, { t: PROMPTS.message, k: "sys" });
      setDraft({ ...d, step: "confirm", message: v });
      return print(
        { t: "── packet preview ──" },
        { t: `from: ${d.name} <${d.email}>` },
        { t: `body: ${v}` },
        { t: PROMPTS.confirm, k: "sys" },
      );
    }
    if (/^y(es)?$/i.test(v)) {
      setDraft(null);
      window.location.href = mailto(`Hello from ${d.name}`, `${d.message}\n\n— ${d.name} (${d.email})`);
      return print({ t: "Packet assembled. Handing off to your mail client ✓", k: "ok" }, { t: `If nothing opened, write to ${profile.email}` });
    }
    setDraft(null);
    print({ t: "Transmission aborted.", k: "err" });
  };

  const run = (raw: string) => {
    const cmd = raw.trim();
    if (draft) {
      print({ t: `> ${cmd || "(empty)"}`, k: "in" });
      if (cmd.toLowerCase() === "cancel") {
        setDraft(null);
        return print({ t: "Transmission aborted.", k: "err" });
      }
      return runDraft(cmd, draft);
    }
    print({ t: `$ ${cmd}`, k: "in" });
    if (!cmd) return;
    setHistory((h) => [cmd, ...h].slice(0, 30));
    const [c, ...args] = cmd.toLowerCase().split(/\s+/);
    switch (c) {
      case "help":
        return print(
          { t: "whoami      who is on the other end" },
          { t: "contact     email + socials" },
          { t: "send        compose a message to me" },
          { t: "email       open your mail client" },
          { t: "copy        copy my email address" },
          ...(profile.links.linkedin ? [{ t: "linkedin    open LinkedIn" }] : []),
          { t: "github      open GitHub" },
          { t: "skills      core stack" },
          { t: "exp         experience modules" },
          { t: "projects    PCIe cards + archive" },
          { t: "cd <part>   jump to cpu | memory | pcie | archive | bios" },
          { t: "clear       clear the screen" },
          { t: "exit        unplug the fiber" },
        );
      case "whoami":
        return print({ t: `${profile.name} · ${profile.role} (${profile.focus})` }, { t: `${profile.location} · 4+ years shipping web + mobile products` });
      case "contact":
      case "social":
        return print(
          { t: `email     ${profile.email}` },
          ...(Object.entries(profile.links) as [string, string][]).filter(([, u]) => u).map(([k, u]) => ({ t: `${k.padEnd(9)} ${u}` })),
        );
      case "send":
      case "message":
      case "msg":
        setDraft({ step: "name" });
        return print({ t: "Composing new packet. Type 'cancel' to abort.", k: "sys" }, { t: PROMPTS.name, k: "sys" });
      case "email":
      case "mail":
        window.location.href = mailto("Hello Abdul", "");
        return print({ t: `Opening mail client → ${profile.email}`, k: "ok" });
      case "copy":
        copyEmail().then((ok) => print(ok ? { t: "Email copied to clipboard ✓", k: "ok" } : { t: `Clipboard blocked. Email: ${profile.email}`, k: "err" }));
        return;
      case "linkedin":
      case "github":
        if (!profile.links[c]) return print({ t: `${c}: not configured`, k: "err" });
        window.open(profile.links[c], "_blank", "noopener");
        return print({ t: `Opening ${c} ↗`, k: "ok" });
      case "skills":
        return print(...profile.skillTree.map((b) => ({ t: `${b.branch.padEnd(9)} ${b.skills.map((s) => s.name).join(", ")}` })));
      case "exp":
      case "experience":
        return print(...experience.map((e, i) => ({ t: `0x${(i * 32).toString(16).padStart(2, "0")}  ${e.company.padEnd(18)} ${e.period}` })));
      case "projects":
      case "ls":
        return print(
          ...featured.map((p, i) => ({ t: `x16·${i + 1}  ${p.name}  ·  ${p.tagline}` })),
          { t: `+ ${archive.length} more in /mnt/archive (cd archive)`, k: "sys" },
        );
      case "cd":
      case "open": {
        const target = SECTIONS[args[0] ?? ""];
        if (!target) return print({ t: `cd: no such component: ${args[0] ?? ""}`, k: "err" });
        sfx.click();
        open(target);
        return;
      }
      case "clear":
        return setLines([]);
      case "date":
        return print({ t: new Date().toString() });
      case "sudo":
        if (args.join(" ") === "hire-me" || args.join(" ") === "hire me")
          return print({ t: "[sudo] permission granted ✓", k: "ok" }, { t: "Offer packet queued. Run 'send' to attach the details.", k: "sys" });
        return print({ t: "Nice try.", k: "err" });
      case "exit":
      case "unplug":
        sfx.close();
        close();
        return;
      default:
        return print({ t: `command not found: ${c} (try 'help')`, k: "err" });
    }
  };

  const onKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      run(value);
      setValue("");
      setHIdx(-1);
    } else if (e.key === "ArrowUp" && !draft) {
      e.preventDefault();
      const i = Math.min(history.length - 1, hIdx + 1);
      if (history[i] !== undefined) {
        setHIdx(i);
        setValue(history[i]);
      }
    } else if (e.key === "ArrowDown" && !draft) {
      e.preventDefault();
      const i = hIdx - 1;
      setHIdx(Math.max(-1, i));
      setValue(i >= 0 ? history[i] : "");
    } else if (e.key.length === 1) sfx.key();
  };

  return (
    <>
      <h2>Open a line</h2>
      <p>Freelance work, full-time roles, or just talking shop. The fiber is live.</p>
      <div className="contact-card">
        <button onClick={copyEmail}>
          <small>{copied ? "COPIED ✓" : "EMAIL · CLICK TO COPY"}</small>
          <span>{profile.email}</span>
        </button>
        <div>
          {profile.links.linkedin && (
            <a href={profile.links.linkedin} target="_blank" rel="noreferrer" style={{ marginBottom: 6 }}>
              <small>LINKEDIN ↗</small>
              <span>Connect</span>
            </a>
          )}
          <a href={profile.links.github} target="_blank" rel="noreferrer">
            <small>GITHUB ↗</small>
            <span>{profile.links.github.replace("https://", "")}</span>
          </a>
        </div>
      </div>

      {!plugged ? (
        <div className="handshake">
          {HANDSHAKE.slice(0, shake).map((h) => (
            <div key={h}>
              {h} <span className="ok">OK</span>
            </div>
          ))}
          <div className="cursor">Waiting for link</div>
        </div>
      ) : (
        <>
          <div className="terminal" onClick={() => input.current?.focus()}>
            <div className="term-out" ref={out}>
              {lines.map((l, i) => (
                <div key={i} className={l.k}>
                  {l.t}
                </div>
              ))}
            </div>
            <div className="term-in">
              <label htmlFor="term">{draft ? ">" : "guest@mb-am01:~$"}</label>
              <input
                id="term"
                ref={input}
                value={value}
                onChange={(e) => setValue(e.target.value)}
                onKeyDown={onKey}
                autoComplete="off"
                spellCheck={false}
                aria-label="Terminal input"
              />
            </div>
          </div>
          <div className="quick">
            {["send", "whoami", "contact", "skills", "projects", "help"].map((q) => (
              <button key={q} className="chip-btn" onClick={() => run(q)}>
                {q}
              </button>
            ))}
          </div>
        </>
      )}
    </>
  );
}
