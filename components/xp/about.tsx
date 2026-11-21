import { Note } from "@/components/xp/note"

// Written from Rithwik's own earlier writing and what he has said about himself: the lede and the
// line about not trusting a number he can't explain are his; movies, mysteries, suspense, horror
// and the chess bot are his interests. The career story itself lives in "Where I've worked".
export function About() {
  return (
    <div className="xp-about">
      <div className="xp-about-side">
        <p className="xp-about-lede">I got into computer science through machine learning. What kept me there was everything around the model.</p>
      </div>

      <div className="xp-about-text">
        <p>I like knowing <em>why</em>. In machine learning that&apos;s a slightly inconvenient habit, because plenty of things work without anyone being sure why. So a good score makes me curious before it makes me happy. I don&apos;t trust a number until I can explain it, and most of my favourite work started with a result that looked fine and wasn&apos;t.</p>
        <p>The other half of me watches films. I notice the cut, the pacing, and what the first ten seconds choose to hide. If the opening of this site felt like a title sequence, that&apos;s where it came from.</p>
        <p className="xp-about-off">I&apos;m drawn to mysteries, slow-burn suspense and the kind of horror that makes you pay attention. It&apos;s the same itch as debugging: something is off, and I want to know exactly why. That&apos;s probably why my current course project is a chess bot that has to play without seeing most of the board.</p>
        <p className="xp-about-now">What I want next is work where someone has to trust the result.</p>
      </div>
      <Note className="is-about">Every claim here traces back to my résumé, my repositories, or my own words.</Note>
    </div>
  )
}
