import { FoundersLetter } from "./FoundersLetter";
import Hero from "./Hero";
import { TheCraft } from "./TheCraft";
import { TheFuture } from "./TheFuture";
import { TheSpark } from "./TheSpark";

export default function OurStory() {
  return (
    <>
    <Hero/>
      <TheSpark/>
      <TheCraft/>
      <TheFuture/>
      <FoundersLetter/>
    </>
  );
}