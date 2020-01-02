var app = {
    services: cordova.plugins && cordova.plugins.playGamesServices,
    leaderBoardId: "CgkI1tKg6vgNEAIQAw",
    score: 0,

    loginRelatedContainers: (function () {
        return Array.from(document.querySelectorAll('.login'));
    })(),

    logoutRelatedContainers: (function () {
        return Array.from(document.querySelectorAll('.logout'));
    })(),

    nameContainer: (function () {
        return document.getElementById('name');
    })(),

    scoreContainer: (function () {
        return document.getElementById('score');
    })(),

    addScoreButton: (function () {
        return document.getElementById('addscore');
    })(),

    showAllLeaderboardsButton: (function () {
        return document.getElementById('showallleaderboards');
    })(),

    showLeaderboardButton: (function () {
        return document.getElementById('showleaderboard');
    })(),

    showAchievementsButton: (function () {
        return document.getElementById('showachievements');
    })(),

    loginButton: (function () {
        return document.getElementById('login');
    })(),

    logoutButton: (function () {
        return document.getElementById('logout');
    })(),

    initialize: function() {
        document.addEventListener('deviceready', this.onDeviceReady.bind(this), false);
        this.loginButton.addEventListener('click', this.onLoginButtonClicked.bind(this), false);
        this.logoutButton.addEventListener('click', this.onLogoutButtonClicked.bind(this), false);
        this.addScoreButton.addEventListener('click', this.onAddScoreButtonClicked.bind(this), false);
        this.showAllLeaderboardsButton.addEventListener('click', this.onShowAllLeaderboardsButtonClicked.bind(this), false);
        this.showLeaderboardButton.addEventListener('click', this.onShowLeaderboardButtonClicked.bind(this), false);
        this.showAchievementsButton.addEventListener('click', this.onShowAchievementsButtonClicked.bind(this), false);
    },

    onDeviceReady: function() {
        this.services = cordova.plugins.playGamesServices;
        var self = this;
        this.receivedEvent('deviceready');
        this.services.isSignedIn(function(response) {
            if (response.isSignedIn) {
                self.loggedIn();
            } else {
                self.loggedOut();
            }
        });
    },

    onShowAchievementsButtonClicked: function() {
        this.services.showAchievements();
    },

    onAddScoreButtonClicked: function() {
        var self = this;
        var newScore = this.score + 10;
        this.services.submitScoreNow({
            leaderboardId: self.leaderBoardId,
            score: newScore
        }, function(response) {
            self.setScore(response.rawScore);
        });
    },

    onShowAllLeaderboardsButtonClicked: function() {
        this.services.showAllLeaderboards();
    },

    onShowLeaderboardButtonClicked: function() {
        this.services.showLeaderboard({
            leaderboardId: this.leaderBoardId
        });
    },

    onLoginButtonClicked: function() {
        var self = this;
        this.services.auth(function() {
            self.loggedIn();
        }, function() {
            self.loggedOut();
        });
    },

    onLogoutButtonClicked: function() {
        var self = this;
        this.services.signOut(function() {
            self.loggedOut();
        });
    },

    setScore: function(score) {
        this.score = score;
        this.scoreContainer.innerText = 'Score: ' + score;
    },

    loggedIn: function() {
        var self = this;
        this.services.showPlayer(function (response) {
            self.nameContainer.innerText = 'Hello ' + response.displayName;
        });
        this.services.getPlayerScore({leaderboardId: self.leaderBoardId}, function (response) {
            self.setScore(response.playerScore);
        });
        this.loginRelatedContainers.forEach(function (value) {
            value.setAttribute('style', 'display:none;');
        });
        this.logoutRelatedContainers.forEach(function (value) {
            value.setAttribute('style', 'display:block;');
        });
    },

    loggedOut: function() {
        this.loginRelatedContainers.forEach(function (value) {
            value.setAttribute('style', 'display:block;');
        });
        this.logoutRelatedContainers.forEach(function (value) {
            value.setAttribute('style', 'display:none;');
        });
    },

    receivedEvent: function(id) {
        var parentElement = document.getElementById(id);
        var listeningElement = parentElement.querySelector('.listening');
        var receivedElement = parentElement.querySelector('.received');

        listeningElement.setAttribute('style', 'display:none;');
        receivedElement.setAttribute('style', 'display:block;');

        console.log('Received Event: ' + id);
    }
};

app.initialize();
