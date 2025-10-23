"use server";

import prisma from "@/prisma/db";
import { customAlphabet } from "nanoid";

const adjectives = [
  "brave",
  "clever",
  "swift",
  "tiny",
  "giant",
  "happy",
  "calm",
  "fierce",
  "gentle",
  "wild",
  "silent",
  "loud",
  "bold",
  "shy",
  "bright",
  "dark",
  "sunny",
  "stormy",
  "chilly",
  "warm",
  "funny",
  "serious",
  "sleepy",
  "quick",
  "lazy",
  "kind",
  "wise",
  "young",
  "old",
  "new",
  "ancient",
  "lucky",
  "smart",
  "strong",
  "weak",
  "cool",
  "hot",
  "icy",
  "fiery",
  "sharp",
  "soft",
  "rough",
  "smooth",
  "tough",
  "quiet",
  "noisy",
  "sneaky",
  "proud",
  "humble",
  "noble",
];

const animals = [
  "lion",
  "tiger",
  "bear",
  "wolf",
  "fox",
  "dog",
  "cat",
  "horse",
  "cow",
  "pig",
  "sheep",
  "goat",
  "deer",
  "rabbit",
  "mouse",
  "rat",
  "elephant",
  "giraffe",
  "zebra",
  "hippo",
  "rhino",
  "kangaroo",
  "koala",
  "panda",
  "sloth",
  "monkey",
  "ape",
  "gorilla",
  "dolphin",
  "whale",
  "shark",
  "turtle",
  "snake",
  "lizard",
  "frog",
  "toad",
  "eagle",
  "hawk",
  "owl",
  "crow",
  "parrot",
  "penguin",
  "duck",
  "goose",
  "chicken",
  "fish",
  "crab",
  "lobster",
  "octopus",
  "squid",
];
const nanoid = customAlphabet("abcdefghijklmnopqrstuvwxyz", 3);

export async function generateSlug(): Promise<string> {
  const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
  const animal = animals[Math.floor(Math.random() * animals.length)];
  const rand = nanoid();
  return `bgm-${adj}-${animal}-${rand}`;
}

export async function generateUniqueUserSlug(): Promise<string> {
  let slug: string = "";
  let isUnique = false;

  while (!isUnique) {
    slug = await generateSlug();
    const existingUser = await prisma.user.findUnique({
      where: { slug },
    });

    if (!existingUser) {
      isUnique = true;
    }
  }

  return slug;
}
