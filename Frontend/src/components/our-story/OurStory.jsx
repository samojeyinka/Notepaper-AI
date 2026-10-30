import { FoundersLetter } from "./FoundersLetter";
import Hero from "./Hero";
import { TheCraft } from "./TheCraft";
import { TheFuture } from "./TheFuture";
import { TheSpark } from "./TheSpark";

export default function OurStory() {
  return (
    <main className="our-story-page">
      <Hero />
      <TheSpark />
      <TheCraft />
      <TheFuture />
      <FoundersLetter />
    </main>
  );
}
