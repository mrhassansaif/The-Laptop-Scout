# 💻 TheLaptopScout

<p align="center">
  <img src="./public/laptopscout.png" alt="TheLaptopScout" width="100%">
</p>

<p align="center">
  <strong>A modern, mobile-first companion for buying and scouting laptops.</strong>
</p>

<p align="center">
  📋 Checklist &nbsp;•&nbsp; 💻 Laptop Tracking &nbsp;•&nbsp; 📅 Visit History &nbsp;•&nbsp; 🌗 Dark/Light Mode
</p>

---

## 🧠 The Story

Buying a used laptop can be exhausting.

You're checking the CPU, RAM, storage, battery, display, GPU, ports, temperatures, PowerShell commands, benchmarks, price...

Eventually, **dimaag ki dahi ho jati hai.** 😂 <br />
<i>(For my English-only peeps: basically, your brain turns to mush.😂)</i>

A couple of years ago, during one of those *"I should probably be sleeping right now"* nights, boredom and insomnia teamed up and I built **[LaptopScout](https://github.com/mrhassansaif/LaptopScout)** — a small React + Vite project to keep useful laptop-buying checks and information in one place.

Fast-forward to today: I finally had the time and motivation to give that old project the glow-up it deserved.

**TheLaptopScout** is a complete revamp of the original idea — rebuilt with a modern stack, better architecture, a mobile-first UI, automatic visit tracking, Firestore, Light/Dark mode, and a much more polished design.

Basically:

> **3 AM boredom → random project → actually useful → full rebuild.**

---

## ✨ What It Does

TheLaptopScout keeps the entire laptop-hunting process in one place.

* 📋 **Laptop Buying Checklist** — Check hardware, software, battery, display, ports, benchmarks and more. Progress stays sticky on mobile, and there's a Clear Checklist action when you want a fresh start.
* 💻 **Add Laptop** — Save laptop name, price, details, shop number and shopkeeper information.
* 📅 **Automatic Visits** — Entries are automatically grouped by the date they were added.
* 🗂️ **Visit History** — Browse previous visits, filter by visit date, and open laptop detail cards without digging through giant tables.
* 🌗 **Dark / Light Mode** — Pick your preferred theme.
* 📱 **Mobile First** — Responsive layouts for phone and desktop, including sticky headers, bottom navigation, and a sticky Save Laptop action on Add Laptop.
* 🔐 **Session login** — Auth uses browser-session persistence. Refreshing or navigating around should keep you signed in; ending that tab/window session is intended to require signing in again. Exact browser behavior can vary a bit.

---

### 🚪 The "Oops, We Forgot to Log Out" Button

I go laptop hunting with my friend. Sometimes we get deep into checking machines, arguing about prices, chatting with shopkeepers… and then we walk out without logging out of the app.

Obviously, I don't want the next shopkeeper who gets hold of that laptop or browser to open TheLaptopScout and casually read our saved entries and shopping notes.

So I added an admin-only **Force Logout All Sessions** button.

It asks for confirmation first. When an authorized admin confirms it, signed-in LaptopScout sessions should lose access across devices — including the admin who pressed the button. Online sessions are meant to notice the revocation, bounce back to the sign-in screen, and require signing in again.

### Yes. We built a whole security feature because two people occasionally forget to tap Logout. 😂

This is wired up and the dependency fix for it has passed local tests, lint, and build. A successful live cross-device logout still needs a proper production check, so treat that part as "works in theory, verify in the wild."

---

## 🖥️ Preview

<p align="center">
  <img src="./public/laptopscout1.png" alt="TheLaptopScout Dashboard" width="49%">
  <img src="./public/laptopscout2.png" alt="TheLaptopScout Visits" width="49%">
</p>

---

## 🛠️ Tech Stack

* **Next.js**
* **TypeScript**
* **Tailwind CSS**
* **shadcn/ui**
* **Firebase Authentication**
* **Firestore**

---

## 🚀 Open Source

**TheLaptopScout is now open source. 🎉**

Want to run your own version?

Clone or fork the repository, connect **your own** Firebase project, add your own `.env.local` (use the example env files as a guide — never commit real keys), and you're good to go.

You can freely:

* 🎨 Redesign the UI
* ✨ Add features
* 📋 Modify the checklist
* 🗃️ Change the data structure
* 🧠 Experiment with the logic
* 🚀 Deploy your own version
* 💡 Suggest improvements

If you build something cool with it, I'd love to see it.

---

## 🔮 What's Next?

Still under consideration: **📸 Image Uploads for Laptop Entries** (not built yet).

Imagine saving:

```text
Acer Nitro V15
PKR 135,000

📸 Front
📸 Keyboard
📸 Display
📸 Damage / Condition
📸 Serial Sticker
```

That way, when you revisit an old shop visit months later, you don't just remember the specs and price — **you can actually see the laptop you checked.**

More improvements will probably happen whenever I get bored again. 😂

---

## 🤝 Contributing

Found a bug? Have an idea? Think the UI needs more sauce?

Feel free to open an **Issue** or submit a **Pull Request**.

Suggestions, improvements, redesigns, and completely random ideas are welcome.

---

## ⭐ One Last Thing

TheLaptopScout started because I couldn't sleep and had nothing better to do.

Now it's a proper open-source project.

**Not bad for a late-night idea. 😎**

<p align="center">
  Built with boredom, insomnia, caffeine, and questionable late-night decisions.
  <br><br>
  <strong>Happy laptop hunting. 💻</strong>
</p>
