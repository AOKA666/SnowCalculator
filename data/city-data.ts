export type CityProfile = {
  name: string
  slug: string
  intro: string
  whyHighlights: string[]
  snowThresholds: { range: string; impact: string }[]
  decisionWindow: string
  faq: { question: string; answer: string }[]
  currentChance: number
  statusLabel: string
  trend: string
}

export const cityProfiles: CityProfile[] = [
  {
    name: "Chicago",
    slug: "chicago-school-closure",
    intro:
      "Chicago families know the impact of lake-effect snow, rush-hour traffic, and midwest wind chills. This page captures what school officials watch when a winter storm approaches the Windy City.",
    whyHighlights: [
      "Lake Michigan often feeds quick snowbands that dump several inches during overnight hours.",
      "Chicago Public Schools coordinate with CTA and Metra crews to keep morning rush-hour routes safe.",
      "Wind chills below zero can freeze bus air lines and make street crossings dangerous, so crews act early.",
    ],
    snowThresholds: [
      { range: "2-4 inches", impact: "Districts stay alert but usually stay open unless the snow is wet and heavy." },
      { range: "4-6 inches", impact: "Closures become more likely if the snow arrives before daybreak and creates slick roads." },
      {
        range: "6+ inches",
        impact: "Most districts make the call to cancel once snow accumulation exceeds six inches with strong winds.",
      },
    ],
    decisionWindow:
      "Chicago school districts generally announce closures between 4:30 and 6:30 AM to give families time before the commute.",
    currentChance: 2,
    statusLabel: "Lake-effect snow bands moving inland",
    trend: "Crews keep a close watch on overnight squalls and subzero wind chills before declaring closures.",
    faq: [
      {
        question: "How much does lake-effect snow influence Chicago school closures?",
        answer:
          "It drives the decisions. A narrow band can drop heavy snow on the city while suburbs stay clear, so districts watch radar and forecasts closely.",
      },
      {
        question: "Do CTA train conditions change the closure decision?",
        answer:
          "Yes. If rapid transit or commuter rails stop, school transportation becomes unreliable and closures are more likely.",
      },
      {
        question: "Will schools close if the snowfall stops before sunrise?",
        answer:
          "They might, especially if temperatures stay below freezing and treat crews cannot keep up with plows.",
      },
    ],
  },
  {
    name: "Boston",
    slug: "boston-school-closure",
    intro:
      "Boston residents prepare for nor'easters, coastal flooding, and cold ocean winds. Here is how schools weigh those elements when deciding on a snow day.",
    whyHighlights: [
      "Nor'easters bring wet, heavy snow that can overwhelm plow crews and create coastal sleet before dawn.",
      "Public transit, including the MBTA, plays a huge part because families rely on trains and buses for morning commute.",
      "Salt and sand crews must first tackle flooded streets and bridges before schools can safely open.",
    ],
    snowThresholds: [
      { range: "2-3 inches", impact: "Timely treatments keep roads open, but districts stay alert near freezing temperatures." },
      { range: "4-6 inches", impact: "Closures are considered if heavy snow coincides with wind gusts and visibility drops." },
      { range: "6+ inches", impact: "A full snow day is likely, especially if the storm includes ice or piled drifts." },
    ],
    decisionWindow:
      "Boston area districts typically decide between 5:00 and 6:15 AM once MBTA updates and police reports arrive.",
    currentChance: 3,
    statusLabel: "Nor'easter wind and wet snow",
    trend: "Coastal gusts and MBTA delays increase the chance of a snow day, especially when sleet mixes in.",
    faq: [
      {
        question: "How does coastal wind affect closures in Boston?",
        answer:
          "Gusts can make sidewalks hazardous and slow down buses, so districts add this to the snow totals before deciding.",
      },
      {
        question: "Are school closures different for city and suburban districts?",
        answer:
          "Yes. Urban districts may close sooner because logistics are tougher, while suburbs may stay open until snow accumulates more.",
      },
      {
        question: "What role does the MBTA play in the decision?",
        answer:
          "If key lines are delayed or suspended, districts assume families cannot rely on transit and may cancel classes.",
      },
    ],
  },
  {
    name: "Denver",
    slug: "denver-school-closure",
    intro:
      "Denver pupils face mountain storms, icy passes, and rapid temperature swings. This page explains the local cues that trigger a snow day in the Mile High City.",
    whyHighlights: [
      "Mountain snowfall can drop suddenly, shutting down mountain passes that school buses use from the suburbs.",
      "Cold snaps with strong winds create whiteouts that make morning drop-offs risky.",
      "Icy roads and elevated avalanche alerts on nearby corridors force districts to cancel early.",
    ],
    snowThresholds: [
      { range: "1-2 inches", impact: "Closures stay rare unless the snow turns to ice or is paired with high winds." },
      {
        range: "3-5 inches",
        impact: "Plows have to work the foothills; districts lean toward delay or closure depending on wind.",
      },
      { range: "5+ inches", impact: "A full snow day is common when storms are slow-moving and cover the city and mountains." },
    ],
    decisionWindow:
      "Denver districts issue closure notices between 5:00 and 7:00 AM after transit and district crews report on road conditions.",
    currentChance: 2,
    statusLabel: "Mountain snowbands and icy passes",
    trend: "Rapid temperature swings in the foothills make plowing a race against time before the commute.",
    faq: [
      {
        question: "Does the elevation change delay closures in Denver?",
        answer:
          "Yes. The foothills can see snow earlier than the city, so districts monitor multiple radar returns before announcing.",
      },
      {
        question: "How does wind affect Denver school closures?",
        answer:
          "Sustained winds above 30 mph reduce visibility and make transportation unsafe, tipping the scale toward a closure.",
      },
      {
        question: "Are afternoon storms considered?",
        answer:
          "If a storm arrives later but lingers into dismissal, districts may issue an early release even if morning classes start.",
      },
    ],
  },
]
