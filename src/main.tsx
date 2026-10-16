import { createRoot } from "react-dom/client";
import "./index.css";
import Game from "./game.tsx";

createRoot(document.getElementById("root")!).render(<Game />);
