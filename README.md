# Timer App

<img width="1437" alt="image" src="https://github.com/user-attachments/assets/950309e6-886e-430c-9390-385458c1c699" />
<img width="1440" alt="image" src="https://github.com/user-attachments/assets/88daf5bd-5970-4561-a7e8-3e02148f8bdb" />
<img width="1440" alt="image" src="https://github.com/user-attachments/assets/60512b46-aa18-4332-b88c-eb6ac297e884" />
<img width="259" alt="image" src="https://github.com/user-attachments/assets/16b35248-ab3d-423c-b1cc-19d498646451" />
<img width="1440" alt="image" src="https://github.com/user-attachments/assets/f0c13648-fb32-4bcb-b22a-02f5efa3d9ca" />






A modern, feature-rich timer application built with Next.js, React, and Tailwind CSS.

Live Demo: [timer-app-harikesh.vercel.app](https://timer-app-harikesh.vercel.app)

## Features

- Create, start, pause, and reset multiple timers
- Organize timers by categories
- Control all timers in a category with a single action
- View timer completion history , export/download history in JSON
- Responsive design with dark/light mode
- Offline capabilities with local storage
- Completion notifications with confetti animation

## Tech Stack

- **Framework**: Next.js 15
- **UI**: React 19, Tailwind CSS, Shadcn UI components
- **State Management**: React Hooks
- **Data Persistence**: Local Storage
- **TypeScript**: For type safety
- **Deployment**: Vercel

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm, yarn, or pnpm

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/timer-app.git
   cd timer-app
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn
   # or
   pnpm install
   ```

3. Run the development server:
   ```bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Build for Production

```bash
npm run build
# or
yarn build
# or
pnpm build
```

## Assumptions Made During Development

1. **Local Storage**: The app assumes browsers have local storage enabled for state persistence.
2. **Browser Compatibility**: The app targets modern browsers with ES6+ support.
3. **User Experience**: 
   - Timers should continue running if the tab remains open, even if inactive.
   - A completed timer should show a notification.
   - Category controls should affect only visible timers in that category.
4. **Offline Usage**: The app should work offline without requiring a server.
5. **No User Accounts**: The current implementation doesn't support user accounts or cloud syncing.

## Project Structure

- `/app`: Main application pages using the App Router
- `/components`: Reusable UI components
- `/hooks`: Custom React hooks for state management
- `/lib`: Utility functions
- `/public`: Static assets
- `/styles`: Global styles
- `/types`: TypeScript type definitions

## Features to Consider for Future Development

- User accounts and cloud syncing
- Pomodoro technique integration
- Timer templates
- Statistics and analytics
- Mobile app using React Native 
