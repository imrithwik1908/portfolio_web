import Link from "next/link"
import { Arrow } from "@/components/xp/arrow"
import { Note } from "@/components/xp/note"

// Written from Rithwik's own earlier writing and his description of himself.
export function About() {
  return (
    <div className="xp-about">
      <div className="xp-about-side">
        <p className="xp-about-lede">I got into computer science through machine learning. What kept me there was everything around the model.</p>
      </div>

      <div className="xp-about-text">
        <p>At IIT Indore, a model could get the label right and still be wrong about why. Checking which words it leaned on, in three languages, taught me not to trust a good number until I can explain it. <Link href="/projects/x-mutest" className="xp-inline-link">That became X-MuTeST <Arrow /></Link></p>
        <p>Blackcoffer was the opposite kind of problem: messy business data, no clean benchmark, and someone waiting on a forecast. There I learned to ask what the data can actually support before reaching for a model.</p>
        <p>At ASU those two lessons met. <Link href="/projects/agentguard" className="xp-inline-link">AgentGuard <Arrow /></Link> exists because an average score can go up while the cases you care about quietly break.</p>
        <p className="xp-about-off">Away from code, I like mysteries, slow-burn suspense and the kind of horror that makes you pay attention. It&apos;s the same itch as debugging: something is off, and I want to know exactly why. That&apos;s probably why my current course project is a chess bot that has to play without seeing most of the board.</p>
      </div>
      <div className="xp-quests">
        <p className="xp-col-label">Side quests <span className="xp-scribble">small things, built for fun</span></p>
        <ul>
          <li><i>CSE 598</i><b>A Fog-of-War chess agent</b><span>Chess where you can&apos;t see most of the board</span></li>
          <li><i>on this site</i><b><Link href="/projects/agentguard#ch-decisions">The release-check playground</Link></b><span>Tick what broke, get the verdict</span></li>
          <li><i>on this site</i><b><Link href="/projects/course-catalog#ch-debugging">Crash between two writes</Link></b><span>Watch two documents disagree</span></li>
          <li><i>on this site</i><b><Link href="/#education">A globe with tonight&apos;s night side</Link></b><span>Drag it; double-click to fly</span></li>
          <li><i>on this site</i><b>Keyboard shortcuts</b><span>Press ? anywhere</span></li>
        </ul>
      </div>
      <Note className="is-about">Every claim here traces back to my résumé, my repositories, or my own earlier notes.</Note>
    </div>
  )
}
