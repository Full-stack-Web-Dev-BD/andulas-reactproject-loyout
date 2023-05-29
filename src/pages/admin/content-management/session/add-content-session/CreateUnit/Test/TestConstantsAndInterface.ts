export interface IUnitOptions {
    duration?: number;
    passScore?: number;
    shuffleQuestions?: boolean;
    shufflePossibleAnswers?: boolean;
    allowRepeatTest?: boolean;
    maximumAttemps?: boolean;
    numberOfMaximumAttemps?: number;
    showCorrectAnswers?: boolean;
    showGivenAnswers?: boolean;
    showCorrectOrIncorrectLabels?: boolean;
    showTestScoreAndIfPass?: boolean;
    showStatsAfterCompletion?: boolean;
    hideQuestionsAnsweredCorrectly?: boolean;
    limitAnswerFeedback?: boolean;
    allowMovementQuestions?: boolean;
    checkNotContinueUntilCorrectAnswer?: boolean;
    anbandonImmediatelyWheneverCantPass?: boolean;
    requireSnapshotToStart?: boolean;
    requirePasswordToStart?: boolean;
    password?: string;
    description?: string;
    messageIfPass?: string;
    messageIfNotPass?: string;
    shortAnswersAfterCompletion?: boolean;
    dontContinueUntilAnswerIsChosen?: boolean;
}

export function shuffle(array: any[]) {
    let currentIndex = array.length,
        randomIndex;

    // While there remain elements to shuffle.
    while (currentIndex != 0) {
        // Pick a remaining element.
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;

        // And swap it with the current element.
        [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
    }

    return array;
}

export const initialUnitOptions: IUnitOptions = {
    duration: undefined,
    passScore: undefined,
    shuffleQuestions: false,
    shufflePossibleAnswers: false,
    allowRepeatTest: false,
    maximumAttemps: false,
    numberOfMaximumAttemps: undefined,
    showCorrectAnswers: false,
    showGivenAnswers: false,
    showCorrectOrIncorrectLabels: false,
    showTestScoreAndIfPass: false,
    showStatsAfterCompletion: false,
    hideQuestionsAnsweredCorrectly: false,
    limitAnswerFeedback: false,
    allowMovementQuestions: false,
    checkNotContinueUntilCorrectAnswer: false,
    anbandonImmediatelyWheneverCantPass: false,
    requireSnapshotToStart: false,
    requirePasswordToStart: false,
    password: undefined,
    description: undefined,
    messageIfPass: undefined,
    messageIfNotPass: undefined,
    shortAnswersAfterCompletion: false,
    dontContinueUntilAnswerIsChosen: false,
}