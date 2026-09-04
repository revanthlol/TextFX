<p align="center">
  <h1 align="center">TextFX</h1>
</p>
  
<p align="center">
  <img src="textfx.svg" alt="TextFX Demo" style="display: block; margin: 0 auto;">
</p>

## Features

There are other typing-SVG projects out there — but **TextFX** focuses on flexibility, precision, and modern design:

- **Full Google Fonts support**: Use any font available on Google Fonts. Specify the font family name per-line (e.g. `"Roboto"`, `"Bitcount Ink"`); the server will fetch and inline the font files so the SVG renders the same everywhere.
- **Per-line customization**: Set font, color, fontSize, letterSpacing, typingSpeed and deleteSpeed for each line independently.
- **Multi-line input**: Each `lines` item can contain `\n` to render visual line breaks within that item.
- **Accurate spacing & alignment**: Preserves multiple spaces, newlines and supports centering (horizontal/vertical).
- **Flexible deletion behaviors**: `backspace`, `clear`, or `stay` with configurable delete speed.
- **Multiple cursor styles**: `straight`, `underline`, `block`, or `blank`.
- **Intuitive speed controls**: Speed inputs are displayed in characters per second `(char/s)` for more intuitive input.
- **Fine-grained controls**: Pause duration, repeat toggle, border, background, and more.
- **Font weight**: Control the boldness of the font.
- **Server-rendered**: SVG is fully rendered server-side — fonts are inlined so consumers don't need to load fonts on the client.

Short: **more customization, more control, and more shareable animated text** 🎨

## How to Use
1. Run locally or deploy your instance.
2. Enter your text (press Enter to create line breaks — multiple spaces are preserved).
3. Tweak fonts, colors, speeds and cursor; preview updates live.
4. Copy the generated URL or download the SVG and embed it anywhere (README, profile, blog, social, etc.).
5. Star this repo ~ 😄

## Deploy It Yourself
To ensure optimal performance and availability, you can deploy TextFX on your own:

1. Sign in or create a Vercel account at [vercel.com](https://vercel.com/).

2. Click the "Deploy to Vercel" button below:

    [![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Frevanthlol%2FTextFX)

3. Follow the prompts to deploy the application to your Vercel account.

## Run Locally
Prerequisites: Node v18+, npm.

1. Clone this repo:
    ```bash
    git clone https://github.com/revanthlol/TextFX.git
    cd TextFX
    ```
2. Install dependencies:
    ```bash
    npm install
    ```
3. Start the dev server:
    ```bash
    npm run dev
    ```
    Then open `http://localhost:3000`.

## API Options

The SVG is generated via the `/api/svg` endpoint. Customize it with query parameters:

| Parameter | Description | Default |
|---|---|---|
| `lines` | **Preferred** — JSON array of line objects. Each must include `text` and may include per-line style overrides. Use `\n` in text for internal line breaks.| `lines=[{"text":"Hello, World!"},{"text":"And Emojis! 😀🚀"}]`|
| `text` | **Legacy (deprecated)** — Text to be typed. Use `;` to separate lines. Prefer lines. | `Hello, World!;And Emojis! 😀🚀` |
| `font` | Font family for the text. | `Courier Prime` |
| `color` | Text color in hex format. | `#000000` |
| `backgroundColor` | Background color in hex format. | `#ffffff` |
| `width` | Width of the SVG in px. | `450` |
| `height` | Height of the SVG in px. | `150` |
| `fontSize` | Font size of the text in px. | `28` |
| `typingSpeed` | Typing speed in seconds per character. | `0.5` |
| `deleteSpeed` | Deletion speed in seconds per character. | `0.5` |
| `pause` | Pause after a content block in milliseconds. | `1000` |
| `letterSpacing` | Letter spacing in `em`. | `0.1em` |
| `repeat` | Repeat the animation (`true`/`false`). | `true` |
| `center` | Center text horizontally (`true`/`false`). | `true` |
| `vCenter` | Center text vertically (`true`/`false`). | `true` |
| `border` | Show a border (`true`/`false`). | `true` |
| `cursorStyle` | Cursor style (`straight`, `underline`, `block`, `blank`). | `straight` |
| `deletionBehavior` | How deletion is handled: `stay`, `backspace`, `clear`. | `backspace` |
| `fontWeight` | Font weight of the text. | `400` |
| `backgroundOpacity` | Opacity of the SVG background color. | `1` |

**Notes**

- Per-line overrides in `lines` take precedence over global parameters.
- Always URL-encode the `lines` JSON when you put it into a query string — this is required for `\n`, emojis and other special characters. (The demo UI encodes for you automatically.)
- Emojis are supported; they are treated as single graphemes for layout.

**Basic Example (readable form):**  
```
/api/svg?lines=[{"text":"Hello,+World!"}]
```

## Credits & Inspiration

**TextFX** is inspired by **TypingSVG** and [DenverCoder1’s readme-typing-svg](https://github.com/DenverCoder1/readme-typing-svg) — rebuilt and improved with enhanced features, fine-tuned multi-line rendering, per-line customization, and full layout control.

A special thanks to the original creators whose work laid the foundation and inspired this project. ❤️

## Contributing

We welcome contributions to TextFX! Please see our [CONTRIBUTING.md](CONTRIBUTING.md) file for more details on how to get started, report bugs, request features, and submit pull requests.

## License

This project is licensed under the MIT License. See [LICENSE](LICENSE) for details.
