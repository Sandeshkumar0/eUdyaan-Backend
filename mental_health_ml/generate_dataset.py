#!/usr/bin/env python3
"""Generate a large, reproducible, non-identifiable support-topic corpus."""

from __future__ import annotations

import csv
import random
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent
OUTPUT = ROOT / "data" / "support_topics.csv"
RNG = random.Random(20261027)

SEEDS = {
    "anxiety_fear": [
        "I keep worrying that something bad will happen",
        "my mind keeps imagining the worst outcome",
        "I feel afraid even when there is no clear danger",
        "I cannot stop overthinking every small decision",
        "future ko lekar bahut tension ho rahi hai",
        "I get nervous before talking to people",
        "my thoughts are racing and I cannot relax",
        "I am scared I will mess everything up",
        "uncertainty makes me feel constantly on edge",
        "I worry all night about things I cannot control",
        "har baat ko lekar darr lagta hai",
        "I feel tense whenever my phone rings",
    ],
    "panic_distress": [
        "my heart is racing and I feel like I cannot breathe",
        "I suddenly feel trapped and terrified",
        "my chest feels tight and I am shaking",
        "I think I am having a panic attack",
        "everything feels unreal and I need to escape",
        "suddenly saans nahi aa rahi aur bahut darr hai",
        "I am dizzy sweating and overwhelmed right now",
        "a wave of fear hit me out of nowhere",
        "I cannot calm my body down",
        "my hands are trembling and my heart is pounding",
        "I feel I might faint from fear",
        "this intense fear keeps coming in episodes",
    ],
    "low_mood": [
        "I feel empty and sad most days",
        "nothing feels enjoyable anymore",
        "getting out of bed feels very difficult",
        "I have lost interest in everything lately",
        "mann bahut udaas hai kuch acha nahi lagta",
        "I feel hopeless about my life",
        "I have no motivation to do normal things",
        "I keep crying without knowing why",
        "each day feels heavy and pointless",
        "I feel numb rather than happy or sad",
        "I am exhausted and down all the time",
        "I do not feel like myself lately",
    ],
    "loneliness_fomo": [
        "everyone is hanging out without me",
        "social media makes me feel left behind",
        "I feel lonely even in a crowded room",
        "my friends have fun and I am never invited",
        "stories dekh ke lagta hai sab mujhe bhool gaye",
        "I keep comparing my life to people online",
        "I am afraid I am missing all the good experiences",
        "nobody checks on me anymore",
        "I do not feel like I belong in my group",
        "seeing their photos makes me feel excluded",
        "I want connection but do not know how to reach out",
        "weekends feel painfully lonely",
    ],
    "relationship_conflict": [
        "my partner and I keep fighting",
        "I cannot trust them after what happened",
        "my breakup is hurting more than I expected",
        "I feel ignored in my relationship",
        "meri relationship mein bahut confusion hai",
        "they stopped replying and I do not know why",
        "I am scared this relationship is becoming unhealthy",
        "we cannot communicate without arguing",
        "I feel controlled by the person I am dating",
        "my family disapproves of my relationship",
        "I miss my ex and cannot move forward",
        "I keep sacrificing my needs to avoid conflict",
    ],
    "academic_pressure": [
        "exams are making me extremely stressed",
        "I am terrified I will fail this semester",
        "there is too much coursework and no time",
        "my grades feel like they decide my entire future",
        "padhai ka pressure handle nahi ho raha",
        "I cannot focus when I sit down to study",
        "my parents expect marks I cannot achieve",
        "I missed deadlines and now feel stuck",
        "competition in college is exhausting me",
        "I panic whenever I think about results",
        "I feel guilty whenever I take a study break",
        "my thesis work is overwhelming",
    ],
    "burnout": [
        "I am mentally drained from doing too much",
        "even small tasks feel exhausting now",
        "I have been pushing nonstop and cannot continue",
        "college and work have completely burned me out",
        "bilkul energy nahi bachi bas thak gaya hoon",
        "I feel detached from work I used to care about",
        "rest does not seem to recharge me",
        "I am irritable because I have too many responsibilities",
        "I cannot keep up this pace anymore",
        "every day feels like an endless to do list",
        "I am functioning but feel completely depleted",
        "I need a break but feel unable to stop",
    ],
    "grief_loss": [
        "someone close to me died and I miss them",
        "I do not know how to cope with this loss",
        "grief hits me at unexpected moments",
        "our pet died and the house feels empty",
        "unke jaane ke baad sab khali lagta hai",
        "I feel guilty for moments when I am happy after the loss",
        "an anniversary brought all the pain back",
        "I keep expecting them to walk through the door",
        "I lost an important friendship and I am grieving it",
        "I feel alone since my family member passed away",
        "the memories are comforting and painful at once",
        "I am struggling to accept that they are gone",
    ],
    "sleep_difficulty": [
        "I lie awake for hours every night",
        "my sleep schedule is completely broken",
        "I keep waking up and cannot fall back asleep",
        "nightmares are making me afraid to sleep",
        "raat bhar neend nahi aati",
        "I sleep all day and stay awake all night",
        "my thoughts get louder when I go to bed",
        "I wake up exhausted even after enough hours",
        "I have not slept properly in several days",
        "college stress is ruining my sleep",
        "I use my phone until morning because I cannot sleep",
        "I feel anxious as bedtime approaches",
    ],
    "self_esteem": [
        "I never feel good enough",
        "I hate how I look in photos",
        "I compare myself and always feel inferior",
        "one mistake makes me feel like a failure",
        "mujhe lagta hai main kisi kaam ka nahi",
        "compliments make me uncomfortable because I do not believe them",
        "I doubt every ability I have",
        "I am ashamed of who I am",
        "I feel like everyone is better than me",
        "my confidence disappeared after repeated criticism",
        "I talk to myself more harshly than anyone else",
        "I am scared people will discover I am not capable",
    ],
    "anger_conflict": [
        "I lose my temper over very small things",
        "I am angry at everyone lately",
        "I said hurtful things during an argument",
        "my frustration builds until I explode",
        "gussa control nahi ho raha",
        "I feel irritated the moment anyone speaks to me",
        "I want to handle conflict without shouting",
        "resentment toward my family keeps growing",
        "I slam things when I feel unheard",
        "I regret how I react when I am angry",
        "small inconveniences make me furious",
        "I feel tense and ready to argue all day",
    ],
    "substance_concern": [
        "I have started drinking to cope with stress",
        "I cannot relax without getting high",
        "my substance use is affecting college",
        "I promised to stop but used again",
        "stress mein roz drink karne laga hoon",
        "my friends are worried about how much I use",
        "I hide my drinking from my family",
        "I get cravings when I feel upset",
        "I am worried I depend on pills to sleep",
        "using helps briefly but makes everything worse later",
        "I missed class because I was hungover again",
        "I want help cutting down safely",
    ],
    "bullying_harassment": [
        "people at college keep making fun of me",
        "someone is sending me threatening messages",
        "I am being bullied in my class group",
        "they spread rumours about me online",
        "college mein log mujhe harass kar rahe hain",
        "I feel unsafe around a senior who targets me",
        "my classmates exclude and insult me deliberately",
        "someone shared my private photo without permission",
        "I dread campus because of constant teasing",
        "I am afraid to report the harassment",
        "they keep contacting me after I asked them to stop",
        "I feel humiliated by what they posted",
    ],
    "wellbeing_general": [
        "I had a pretty good day today",
        "I want ideas for staying mentally healthy",
        "meditation helped me feel calmer",
        "I am checking in with how I feel",
        "aaj mood theek hai bas baat karni thi",
        "I enjoyed spending time with my friends",
        "how can I build a healthier routine",
        "I feel proud of the progress I made",
        "journaling has been useful for me",
        "I want to understand my emotions better",
        "today felt balanced and manageable",
        "I am doing okay but would like some support",
    ],
    "crisis_self_harm": [
        "I am thinking about killing myself",
        "I want to end my life tonight",
        "I have a plan to hurt myself",
        "everyone would be better without me",
        "I do not think I can stay safe right now",
        "mujhe apni jaan khatam karni hai",
        "I am about to harm myself",
        "I have been searching for a way to die",
        "there is no reason for me to keep living",
        "I wrote goodbye messages to everyone",
        "I might do something dangerous to myself",
        "I cannot promise that I will be safe tonight",
    ],
}

PREFIXES = [
    "", "honestly ", "lately ", "right now ", "for the past few weeks ",
    "I don't know how to say this but ", "please listen, ", "yaar ",
]
SUFFIXES = [
    "", ".", " and I need someone to talk to", " what should I do",
    " and it is affecting my routine", " :(", " please help", " idk anymore",
]
INTENSIFIERS = ["really", "very", "so", "extremely", "constantly"]

# Reusable natural-language signals make the augmentation compositional rather
# than 48 punctuation-only copies. They intentionally describe support needs,
# not medical diagnoses.
SIGNALS = {
    "anxiety_fear": ["the worry will not stop", "I feel anxious and on edge", "fear is taking over"],
    "panic_distress": ["the panic feels physical", "this sudden fear is intense", "my body feels alarmed"],
    "low_mood": ["my mood has stayed low", "the sadness keeps returning", "I feel down and empty"],
    "loneliness_fomo": ["I feel left out", "the loneliness is getting to me", "I have strong fomo"],
    "relationship_conflict": ["this relationship stress is painful", "the conflict keeps repeating", "I need relationship support"],
    "academic_pressure": ["the study pressure is too much", "exams and grades are stressing me", "academic stress is building"],
    "burnout": ["I feel completely burned out", "the exhaustion is not going away", "I have no energy left"],
    "grief_loss": ["I am struggling with grief", "this loss hurts deeply", "I miss them and feel grief"],
    "sleep_difficulty": ["my sleep has become difficult", "I need help with insomnia", "poor sleep is affecting me"],
    "self_esteem": ["my confidence is very low", "I keep judging myself", "my self esteem is hurting"],
    "anger_conflict": ["I need help managing anger", "my irritation is intense", "I cannot regulate my temper"],
    "substance_concern": ["I am worried about my substance use", "using has become a coping habit", "I may be relying on alcohol or drugs"],
    "bullying_harassment": ["this bullying feels unsafe", "the harassment keeps happening", "someone is targeting me"],
    "wellbeing_general": ["I am doing okay overall", "I want to maintain my wellbeing", "this is a positive check in"],
    "crisis_self_harm": ["I may not be safe", "these are self harm thoughts", "I need urgent help now"],
}


def noisy(text: str, label: str, index: int) -> str:
    prefix = PREFIXES[index % len(PREFIXES)]
    suffix = SUFFIXES[(index // len(PREFIXES)) % len(SUFFIXES)]
    value = f"{prefix}{text}{suffix}".strip()
    if index % 7 == 0:
        value = re.sub(r"\bvery\b", RNG.choice(INTENSIFIERS), value, count=1)
    if index % 11 == 0:
        value = value.lower().replace("cannot", "cant").replace("do not", "dont")
    if index % 13 == 0:
        value = value.replace("ing ", "in ", 1)
    signal = SIGNALS[label][index % len(SIGNALS[label])]
    value = f"{value}. {signal}"
    return re.sub(r"\s+", " ", value)


def main() -> None:
    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    rows = []
    for label, seeds in SEEDS.items():
        for seed_index, seed in enumerate(seeds):
            seed_id = f"{label}-{seed_index:02d}"
            for variant in range(48):
                rows.append((noisy(seed, label, variant), label, seed_id, "synthetic"))
    RNG.shuffle(rows)
    with OUTPUT.open("w", encoding="utf-8", newline="") as handle:
        writer = csv.writer(handle, lineterminator="\n")
        writer.writerow(["text", "label", "group_id", "source"])
        writer.writerows(rows)
    print(f"Wrote {len(rows)} examples across {len(SEEDS)} classes to {OUTPUT}")


if __name__ == "__main__":
    main()
