import type { Friend } from "./friendsStore";

export const seedFriends: Friend[] = [
  {
    id: "seed-riley",
    name: "Riley",
    debts: [
      {
        id: "seed-riley-flight",
        title: "Airport rideshare",
        amount: 85,
        description: "Covered group rideshare from airport",
        direction: "fromFriend",
        createdAt: new Date().toISOString(),
      },
    ],
  },
  {
    id: "seed-ava",
    name: "Ava",
    debts: [
      {
        id: "seed-ava-brunch",
        title: "Team brunch",
        amount: 42.5,
        description: "Brunch for the team meetup",
        direction: "toFriend",
        createdAt: new Date().toISOString(),
      },
    ],
  },
];
