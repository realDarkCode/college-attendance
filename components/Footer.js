import { CodeXml, Heart } from "lucide-react";

export default function Footer() {
  return (
    <footer className="mt-12 py-8 text-center glass-card">
      <div className="text-sm text-foreground flex items-center justify-center gap-1">
        Made with{" "}
        <Heart className="inline size-5 text-destructive-foreground" /> by{" "}
        <a
          href="https://github.com/realDarkCode"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center gap-1 text-primary transition-colors hover:underline"
        >
          <CodeXml className="inline size-5 text-primary" />
          DarkCode
        </a>
      </div>
    </footer>
  );
}
