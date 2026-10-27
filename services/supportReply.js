const responses = {
  anxiety_fear: [
    "That sounds like a lot of worry to carry. Try taking one slow breath and naming one thing you can control in the next ten minutes. What thought is looping most strongly right now?",
    "It makes sense that constant uncertainty would leave you on edge. Would it help to separate what needs action today from what can wait?",
  ],
  panic_distress: [
    "That sounds intensely uncomfortable. If you can, place both feet on the floor and slowly name five things you can see, four you can feel, and three you can hear. Are you somewhere physically safe right now?",
  ],
  low_mood: [
    "I’m sorry things have been feeling this heavy. You do not have to solve everything at once—what is one very small thing that might make the next hour more manageable?",
    "Feeling empty or unmotivated can make ordinary tasks feel huge. How long has this been weighing on you, and is there someone you trust who knows?",
  ],
  loneliness_fomo: [
    "Feeling left out can hurt, especially when social media shows only everyone else’s highlights. Is there one person you would feel comfortable messaging directly today?",
  ],
  relationship_conflict: [
    "Relationship uncertainty can take up a lot of emotional space. What do you need most here—clarity, a boundary, an apology, or simply to feel heard?",
  ],
  academic_pressure: [
    "Academic pressure can make the whole future feel tied to one deadline or result. Could we shrink the next step to a single 15-minute task? What is the most urgent piece?",
  ],
  burnout: [
    "It sounds like you have been running without enough recovery. What responsibility could be reduced, postponed, or shared today—even slightly?",
  ],
  grief_loss: [
    "I’m sorry for your loss. Grief does not follow a neat timetable, and mixed emotions are common. Would you like to tell me something you miss or remember about them?",
  ],
  sleep_difficulty: [
    "Poor sleep can make every emotion harder to carry. For tonight, consider a low-light wind-down and putting the phone out of reach for a short period. What usually keeps you awake—thoughts, your schedule, or physical discomfort?",
  ],
  self_esteem: [
    "That inner criticism sounds painful. If a close friend said the same thing about themselves, what would you say to them? Could that response apply to you too?",
  ],
  anger_conflict: [
    "It sounds like the anger builds quickly. Before responding, stepping away and cooling your body can protect you and the relationship. What usually happens just before the anger spikes?",
  ],
  substance_concern: [
    "Noticing that alcohol or another substance has become a coping tool is an important step. Stopping suddenly can be unsafe for some substances, so a doctor or counsellor can help you plan safely. What have you been using and how often?",
  ],
  bullying_harassment: [
    "What is happening is not your fault. Save evidence if it is safe to do so, avoid confronting the person alone, and tell a trusted adult or college authority. Are you in immediate physical danger?",
  ],
  wellbeing_general: [
    "I’m glad you checked in. Small routines—sleep, movement, connection, and a little time offline—can help protect your wellbeing. What would you like to strengthen this week?",
  ],
};

const crisisReply = () => {
  const localHelp = process.env.CRISIS_SUPPORT_MESSAGE ||
    "If you may act on these thoughts or are in immediate danger, contact local emergency services now.";
  const crisisPhone = process.env.CRISIS_PHONE
    ? ` You can also call ${process.env.CRISIS_PHONE}.`
    : "";
  return `I’m really glad you told me. Your immediate safety matters more than continuing this chat. ${localHelp}${crisisPhone} Please move away from anything you could use to hurt yourself and contact a trusted person who can stay with you. Are you in immediate danger or have you already harmed yourself?`;
};

const pickStable = (items, text) => {
  const value = [...text].reduce((total, character) => total + character.codePointAt(0), 0);
  return items[value % items.length];
};

const createSupportReply = (analysis, text) => {
  if (analysis.supportLevel === "crisis") return crisisReply();
  if (analysis.supportLevel === "urgent") {
    return `It sounds like you may need immediate support. Please move to a safer place and contact someone you trust who can be with you. ${pickStable(
      responses[analysis.topic] || responses.wellbeing_general,
      text
    )}`;
  }
  return pickStable(responses[analysis.topic] || responses.wellbeing_general, text);
};

module.exports = { createSupportReply };
