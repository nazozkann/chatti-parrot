import type { ComponentType } from "react";

import PersonalPronounsNominativeExercise from "./personalpronomen-nominativ";
import VerbKonjugationExercise from "./verb-konjugation";

export type TopicExerciseMap = Record<string, ComponentType>;

export const topicExercises: TopicExerciseMap = {
  "verb-konjugation": VerbKonjugationExercise,
  "personalpronomen-nominativ": PersonalPronounsNominativeExercise,
};
