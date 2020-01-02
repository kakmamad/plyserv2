interface ISignedInResponse {
    isSignedIn: boolean;
}

interface IShowPlayerResponse {
    displayName: string;
    playerId: string;
    title: string;
    iconImageUrl: string;
    hiResIconImageUrl: string;
}

interface IGetPlayerScoreInput {
    leaderboardId: string;
}
interface IGetPlayerScoreResponse {
    playerScore: number;
}

interface IShowLeaderboardInput {
    leaderboardId: string;
}

interface ISubmitScoreInput {
    score: number;
    leaderboardId: string;
}
interface ISubmitScoreResponse {
    leaderboardId: string;
    playerId: string;
    formattedScore: string;
    newBest: boolean;
    rawScore: number;
    scoreTag: string;
}

interface IUnlockAchievementInput {
    achievementId: string;
}

interface IIncrementAchievement {
    achievementId: string;
    numSteps: number;
}

interface IPlayGamesServices {
    /**
     * Logs into google play services
     */
    auth(onSignInSucceeded?: () => void, onSignInFailed?: () => void): void;

    /**
     * Logs out from google play services
     */
    signOut(onSignOut?: () => void): void;

    /**
     * Checks if the user is already logged in
     */
    isSignedIn(callback: (response: ISignedInResponse) => void, onError?: () => void): void;

    /**
     * Fetch the currently authenticated player's data.
     */
    showPlayer(onSuccess: (response: IShowPlayerResponse) => void, onError?: () => void): void;

    /**
     * Submits score to a leaderboard
     */
    submitScore(data: ISubmitScoreInput, onSuccess?: () => void, onError?: () => void): void;

    /**
     * Submits score to a leaderboard syncronously and wait for response
     */
    submitScoreNow(data: ISubmitScoreInput, onSuccess: (response: ISubmitScoreResponse) => void, onError?: () => void): void;

    /**
     * Get player's score
     */
    getPlayerScore(data: IGetPlayerScoreInput, onSuccess: (response: IGetPlayerScoreResponse) => void, onError?: () => void): void;

    /**
     * Launches the native Play Games leaderboard view controller to show all the leaderboards.
     */
    showAllLeaderboards(onSuccess?: () => void, onError?: () => void): void;

    /**
     * Launches directly into the specified leaderboard:
     */
    showLeaderboard(data: IShowLeaderboardInput, onSuccess?: () => void, onError?: () => void): void;

    /**
     * Unlocks the specified achievement:
     */
    unlockAchievement(data: IUnlockAchievementInput, onSuccess?: () => void, onError?: () => void): void;

    /**
     * Unlocks the specified achievement and waits for response
     */
    unlockAchievementNow(data: IUnlockAchievementInput, onSuccess: () => void, onError?: () => void): void;

    /**
     * Increments the specified incremental achievement by the provided numSteps:
     */
    incrementAchievement(data: IIncrementAchievement, onSuccess?: () => void, onError?: () => void): void;

    /**
     * Increments the specified incremental achievement by the provided numSteps and waits for response
     */
    incrementAchievementNow(data: IIncrementAchievement, onSuccess?: () => void, onError?: () => void): void;

    /**
     * Launches the native Play Games achievements view controller to show the user’s achievements.
     */
    showAchievements(onSuccess?: () => void, onError?: () => void): void;
}

interface Cordova {
    plugins: {
        playGamesServices: IPlayGamesServices;
    }
}

interface Window {
    plugins: {
        playGamesServices: IPlayGamesServices;
    }
}
