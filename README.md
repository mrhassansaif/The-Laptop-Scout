# TheLaptopScout

LaptopScout started as a project born out of boredom and insomnia, and later got reimagined into a proper mobile-first laptop buying companion. What began as a late-night “I should probably be sleeping” experiment turned into a clean, modern web app that makes the laptop-hunting process less chaotic and a lot less painful.

It is built with a much better tech stack than the original version and focuses on a smooth mobile experience, a polished UI, and a practical workflow for real-world laptop shopping.

## The Story Behind TheLaptopScout

Buying a used laptop can be surprisingly exhausting. Between checking battery health, verifying hardware, remembering PowerShell commands, comparing prices, and trying not to get talked into a “bro trust me this is the best deal” situation, your brain slowly turns into *dahi*.

A couple of years ago, during one of those late-night moments when I was clearly not meant to be productive, boredom and insomnia teamed up and I built **[LaptopScout](https://github.com/mrhassansaif/LaptopScout)** — a small React + Vite project to keep everything I needed in one place while shopping for laptops.

Fast forward to today, I finally had the time, the motivation, and the excuse to give it the overhaul it deserved.

**TheLaptopScout** is a full revamp of that original idea. It is not just a UI refresh — it has been rebuilt from the ground up with a modern tech stack, a mobile-first experience, automatic visit tracking, Firestore integration, a much cleaner architecture, and a more thoughtful user experience that actually feels useful while walking around laptop markets.

The best part is that the project still carries the same fun origin story: a random boredom-fueled idea that accidentally turned into something genuinely useful.

## What it does

TheLaptopScout helps you:

- track your laptop-buying visits
- save laptop details from each shop visit
- group entries automatically by visit date
- review saved laptops in beautiful card layouts
- keep a useful laptop buying checklist handy
- use the app comfortably on mobile first

## Features

### Login and Protected Dashboard
Secure authentication keeps the app protected and personal.  
There is no public sign-up flow — you can connect your own auth/database setup after forking or cloning.

### Add Laptop Entries
Save laptop details such as:

- Laptop Name
- Details
- Shop Number
- Shop Keeper's Number
- Price

Entries are automatically saved with a timestamp and grouped by visit date.

### Visits View
Browse all your shop visits and open each visit to see the laptops saved on that day.

### Checklist
A built-in checklist helps you stay focused while checking specs, hardware, battery, display, and software details before buying.

### Mobile-First UI
The entire app is designed to feel natural on phones first, with a clean layout that also works well on larger screens.

### Dark / Light Mode
Switch between themes depending on your environment and preference.

### Polished Design
The UI is intentionally designed to feel modern, practical, and pleasant to use in the real world, not like a boring table app pretending to be fancy.

## Tech Stack

- **Next.js**
- **TypeScript**
- **Tailwind CSS**
- **shadcn/ui**
- **Firebase Authentication**
- **Firestore**

## Why this exists

LaptopScout started as a project born out of boredom, but over time it turned into something genuinely useful. Instead of being just another rough side project, it was rebuilt into a proper tool with a better structure, a cleaner UI, and a more thoughtful user experience.

## Project Status

This is an active revamp of the original LaptopScout idea. The goal is to keep improving the interface, polish the UX, and make the app more practical for real laptop shopping sessions.

## Contributing

Contributions are welcome. If you find a bug, have a feature idea, or want to improve the UI/UX, feel free to open an issue or submit a pull request.
