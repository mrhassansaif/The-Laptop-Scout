import type { ScreenTestColor } from "./screen-test";

export type ChecklistItemKind =
  | "heading"
  | "question"
  | "check"
  | "command"
  | "tip"
  | "shortcut"
  | "tool"
  | "note"
  | "screen-test";

export type ChecklistEntry = {
  id: string;
  kind: ChecklistItemKind;
  label?: string;
  text?: string;
  command?: string;
  href?: string;
  hint?: string;
  bullets?: string[];
  screenColor?: ScreenTestColor;
};

export type ChecklistSection = {
  id: string;
  title: string;
  description?: string;
  items: ChecklistEntry[];
};

export const CHECKLIST_SECTIONS: ChecklistSection[] = [
  {
    id: "questions",
    title: "Questions",
    description: "Ask these before you buy — in the store or from the seller.",
    items: [
      { id: "q-general", kind: "heading", label: "General" },
      {
        id: "q-model",
        kind: "question",
        text: "What is the exact model and specifications of the laptop?",
      },
      { id: "q-price", kind: "question", text: "What is the price?" },
      {
        id: "q-price-note",
        kind: "tip",
        label: "Note it down (Price Compare)",
        text: "Shop card pe ya us par likh lo — sab compare karo.",
      },
      { id: "q-warranty", kind: "heading", label: "Warranty" },
      {
        id: "q-warranty-active",
        kind: "question",
        text: "Is the laptop still under warranty?",
      },
      {
        id: "q-warranty-time",
        kind: "question",
        text: "Time limit? Minimum 20 days remaining.",
      },
      {
        id: "q-warranty-coverage",
        kind: "question",
        text: "What is covered — and what is not? (especially the screen)",
      },
      {
        id: "q-ports",
        kind: "question",
        text: "Are all ports and connectivity options (USB, HDMI, Ethernet, Wi-Fi, Bluetooth, audio jack) fully functional?",
      },
      {
        id: "q-repairs",
        kind: "question",
        text: "Any repairs or parts replaced? (Backside khol ke check karo)",
      },
      {
        id: "q-battery",
        kind: "question",
        text: "Battery timing or health kesi hai? Original charger included?",
      },
      {
        id: "q-parchi",
        kind: "tip",
        label: "Inspect the parchi",
        text: "Seller ki warranty / receipt slip carefully dekho.",
      },
    ],
  },
  {
    id: "shortcuts",
    title: "Shortcuts",
    description: "Handy keys while inspecting the machine.",
    items: [
      {
        id: "sc-shutdown",
        kind: "shortcut",
        label: "Shut down",
        command: "Win + X, U, U",
      },
      {
        id: "sc-cmd",
        kind: "shortcut",
        label: "Open CMD as Admin",
        command: "Win + X",
      },
    ],
  },
  {
    id: "checkup",
    title: "Check-Up Guide",
    description: "Physical and display checks before you commit.",
    items: [
      {
        id: "cu-hz",
        kind: "check",
        label: "Check Hz setting in display",
        text: "Verify the refresh rate settings in display options.",
      },
      {
        id: "cu-cosmetic",
        kind: "check",
        label: "Jo dikhta woh bikta?",
        text: "Any visible scratches, dents, or damage on the laptop body?",
      },
      {
        id: "cu-input",
        kind: "check",
        label: "Keyboard & trackpad",
        text: "Sticky keys, missed presses, or an unresponsive trackpad?",
      },
      {
        id: "cu-audio",
        kind: "check",
        label: "Speakers, camera & microphone",
        text: "Listen for distortion; test video call quality.",
      },
      {
        id: "cu-white",
        kind: "screen-test",
        label: "White screen",
        screenColor: "WHITE",
        hint: "Spot dead pixels and bright spots.",
      },
      {
        id: "cu-green",
        kind: "screen-test",
        label: "Green screen",
        screenColor: "GREEN",
        hint: "Reveal green sub-pixel issues.",
      },
      {
        id: "cu-red",
        kind: "screen-test",
        label: "Red screen",
        screenColor: "RED",
        hint: "Reveal red sub-pixel issues.",
      },
      {
        id: "cu-black",
        kind: "screen-test",
        label: "Black screen",
        screenColor: "BLACK",
        hint: "Check backlight bleed and dark uniformity.",
      },
    ],
  },
  {
    id: "battery",
    title: "Battery & Energy Report",
    description: "Run these in an elevated Command Prompt.",
    items: [
      {
        id: "bat-report",
        kind: "command",
        label: "Battery report",
        command: "powercfg /batteryreport",
      },
      {
        id: "bat-advice-1",
        kind: "tip",
        label: "Advice",
        text: "Full charge capacity should be 60–70% of design capacity.",
      },
      {
        id: "bat-energy",
        kind: "command",
        label: "Energy report",
        command: "powercfg -energy",
      },
      {
        id: "bat-advice-2",
        kind: "tip",
        label: "Advice",
        text: "Compare full charge capacity vs. design capacity.",
      },
    ],
  },
  {
    id: "ratings",
    title: "Performance Ratings",
    description: "Understand Windows Experience Index scores.",
    items: [
      {
        id: "rate-cmd",
        kind: "command",
        label: "Component performance rating",
        command: "Get-CimInstance Win32_WinSAT",
      },
      {
        id: "rate-explain",
        kind: "note",
        label: "Explanation",
        text: "WinSPRLevel provides an overall performance score based on CPU, RAM, storage, graphics, and 3D capabilities.",
        bullets: [
          "1 to 3 — low-end performance",
          "3 to 5 — mid-range performance",
          "5 to 7 — good performance",
          "7 to 9.9 — high-end performance",
        ],
      },
      {
        id: "rate-script",
        kind: "command",
        label: "PowerShell script",
        text: "Run in PowerShell as Administrator.",
        command: "powershell-winsat",
      },
    ],
  },
  {
    id: "processor",
    title: "Processor Types",
    description: "Quick suffix guide when reading CPU model names.",
    items: [
      {
        id: "proc-u",
        kind: "tip",
        label: "U / P",
        text: "Basic use — efficiency-focused chips.",
      },
      {
        id: "proc-h",
        kind: "tip",
        label: "H / HS / HX",
        text: "Gaming and heavy workloads — higher power draw.",
      },
    ],
  },
  {
    id: "ram",
    title: "RAM",
    items: [
      {
        id: "ram-speed",
        kind: "check",
        label: "Check RAM speed",
        text: "Ensure RAM is at least 3200 MHz.",
      },
    ],
  },
  {
    id: "system-info",
    title: "System Information",
    description: "Commands to verify what you are actually buying.",
    items: [
      {
        id: "si-info",
        kind: "command",
        label: "System information",
        command: "systeminfo",
      },
      {
        id: "si-tasklist",
        kind: "command",
        label: "Task Manager (Admin edition)",
        command: "tasklist",
      },
      {
        id: "si-model",
        kind: "command",
        label: "System model number",
        command: "WMIC CSPRODUCT GET NAME",
      },
      {
        id: "si-serial",
        kind: "command",
        label: "System serial number",
        command: "WMIC BIOS GET SERIALNUMBER",
      },
    ],
  },
  {
    id: "tools",
    title: "Tools: Software & Benchmarks",
    description: "Download and run on-site or at home for deeper testing.",
    items: [
      {
        id: "tool-nzxt",
        kind: "tool",
        label: "NZXT CAM",
        href: "https://nzxt.com/software/cam",
        text: "Monitor system performance and temperatures.",
      },
      {
        id: "tool-cdi",
        kind: "tool",
        label: "CrystalDiskInfo",
        href: "https://crystalmark.info/en/",
        text: "Check SSD name and TBW rating (Google or ChatGPT for reference).",
      },
      {
        id: "tool-cdm",
        kind: "tool",
        label: "CrystalDiskMark",
        href: "https://crystalmark.info/en/",
        text: "Inspect disk speed and performance.",
      },
      {
        id: "tool-coretemp",
        kind: "tool",
        label: "CoreTemp",
        href: "https://www.alcpu.com/CoreTemp/",
        text: "Monitor CPU temperature.",
      },
      {
        id: "tool-cpuz",
        kind: "tool",
        label: "CPU-Z",
        href: "https://www.cpuid.com/downloads/cpu-z/cpu-z_2.15-en.exe",
        text: "Verify CPU specs.",
      },
      {
        id: "tool-gpuz",
        kind: "tool",
        label: "GPU-Z",
        href: "https://www.techpowerup.com/gpuz/",
        text: "Verify GPU specs.",
      },
      {
        id: "tool-cinebench",
        kind: "tool",
        label: "Cinebench",
        href: "https://www.maxon.net/en/downloads/cinebench-2024-downloads",
        text: "CPU benchmark.",
      },
      {
        id: "tool-furmark",
        kind: "tool",
        label: "FurMark",
        href: "https://geeks3d.com/furmark/downloads/",
        text: "GPU stress test and benchmark.",
      },
      {
        id: "tool-memdiag",
        kind: "tool",
        label: "Windows Memory Diagnostics",
        text: "Test system memory for errors. Search in the taskbar.",
      },
    ],
  },
  {
    id: "boost",
    title: "Boost, Security & Fix Commands",
    description: "Quick maintenance and health checks in CMD (Admin).",
    items: [
      {
        id: "boost-dism",
        kind: "command",
        label: "Check health of Windows image",
        command: "Dism /online /Cleanup-Image /CheckHealth",
      },
      {
        id: "boost-temp",
        kind: "command",
        label: "Clear temporary files",
        command: "prefetch, temp, %temp%, mrt, cleanmgr",
      },
      {
        id: "boost-dns",
        kind: "command",
        label: "Flush DNS",
        command: "ipconfig /flushdns",
      },
      {
        id: "boost-users",
        kind: "command",
        label: "Admin users",
        command: "netplwiz",
      },
    ],
  },
];

export const CHECKLIST_FOOTER =
  'Made with care by Hassan — for every tech buyer who does not want to get scammed.';
