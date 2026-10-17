import { createRoot } from "react-dom/client";
import Game from "./game.tsx";
import "./index.css";

createRoot(document.getElementById("root")!).render(<Game />);
