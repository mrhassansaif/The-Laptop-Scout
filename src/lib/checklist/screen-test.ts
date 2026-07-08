export type ScreenTestColor = "WHITE" | "GREEN" | "RED" | "BLACK";

const SCREEN_COLORS: Record<ScreenTestColor, string> = {
  WHITE: "#ffffff",
  GREEN: "#7CFC00",
  RED: "#ff0000",
  BLACK: "#000000",
};

export function openScreenTestWindow(color: ScreenTestColor) {
  const backgroundColor = SCREEN_COLORS[color];
  const newWindow = window.open("", "_blank", "width=800,height=600");

  if (!newWindow) {
    return;
  }

  newWindow.document.write(`
    <html>
      <head>
        <title>Screen Test — ${color}</title>
        <style>
          body {
            background-color: ${backgroundColor};
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            height: 100vh;
            margin: 0;
            font-family: system-ui, sans-serif;
          }
          h1, h2 {
            color: ${color === "BLACK" || color === "RED" ? "#f5f5f5" : "#333"};
          }
        </style>
      </head>
      <body>
        <h1>${color}</h1>
        <h2>Press F11 for fullscreen</h2>
      </body>
    </html>
  `);
}
