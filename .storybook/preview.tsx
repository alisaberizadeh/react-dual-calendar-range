import type { Preview } from "@storybook/react-vite";
import "../src/styles.css";

const preview: Preview = {
  parameters: {
    layout: "centered",
    controls: { expanded: true },
    a11y: { test: "error" },
    backgrounds: {
      options: {
        light: { name: "Light", value: "#f6f5fa" },
        dark: { name: "Dark", value: "#12131b" }
      }
    }
  },
  decorators: [
    (Story) => (
      <div style={{ minHeight: 560, minWidth: 360, padding: 48, display: "grid", placeItems: "start center" }}>
        <Story />
      </div>
    )
  ]
};

export default preview;
