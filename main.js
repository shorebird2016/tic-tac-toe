angular.module('tttApp', [])
    .controller('tttCtrl', ['$timeout', function ($timeout) {
        var vm = this;
        vm.dlgTextVisible = false; vm.dlgImgVisible = false; vm.dlg2Visible = false;
        vm.currentPlayer = 0;//= 0 game not started, = 1 check, = 2 use circle
        vm.player1Symbol = "check.jpg"; vm.player2Symbol = "circle.jpg";//default
        //stores what's shown in the grid
        vm.imageName = [
            "blank.png", "blank.png", "blank.png",
            "blank.png", "blank.png", "blank.png",
            "blank.png", "blank.png", "blank.png"];//0..8

        //--start over
        vm.restartGame = function () {
            vm.currentPlayer = 1;
            for (var i = 0; i < 9; i++)
                vm.imageName[i] = "blank.png";
            vm.msg = "1 or 2 Players ?"; vm.dlgTextVisible = true;
            vm.dlgImgVisible = false;
        };

        //--one/two players
        vm.setPlayer = function (num_player) {
            vm.onePlayer = num_player === 1;
            vm.dlgTextVisible = false;
            if (vm.onePlayer) {
                vm.msg2 = "Which symbol for you?"; vm.dlg2Visible = true;//show symbol picker
                return;
            }
            //for two players, start playing
            vm.dlgImgVisible = true;
            vm.dlgImage = "ready.png";
        };

        //--pick symbol
        vm.setSymbol = function (symbol) {
            if (symbol === 1) {
                vm.player1Symbol = 'check.jpg';
                vm.player2Symbol = "circle.jpg"
            }
            else {
                vm.player1Symbol = 'circle.jpg';
                vm.player2Symbol = "check.jpg";
            }
            vm.dlg2Visible = false;
            vm.dlgImgVisible = true;
            vm.dlgImage = "you-go-first.jpg";
        };
        vm.hideImage = function () {//TODO use animation to fade away
            vm.dlgImgVisible = false;
        };

        //--user clicks on a cell, outcome maybe game over (ties), or winner shows up, or not done yet
        vm.clickCell = function (cell_index) {
            if (vm.imageName[cell_index] !== "blank.png" || vm.currentPlayer === 0) return;//already used or not playing, no clicking

            //track which user this click belongs to, circle team or check team?
            //for circle team - put a circle at this cell
            if (vm.currentPlayer === 1) {
                vm.imageName[cell_index] = vm.player1Symbol;
                vm.currentPlayer = 2;
            }
            else if (vm.currentPlayer === 2) {
                vm.imageName[cell_index] = vm.player2Symbol;
                vm.currentPlayer = 1;//toggle
            }
            evalGameOver();
            if (vm.currentPlayer === 0) return;//no one playing

            //none of the ending conditions is met, let computer play next if 1 player game
            if (vm.currentPlayer === 2 && vm.onePlayer) {//player 1 finished, computer next, figure out next best step logically
//TODO use circles collected above (player 2), check winning patterns and pick a spot
                //pick a random index from blanks list
                var idx = Math.floor(Math.random() * vm.blanks.length);
                vm.imageName[vm.blanks[idx]] = vm.player2Symbol;
                vm.currentPlayer = 1;
                evalGameOver();
            }

        };//---clickCell()---

        //detail handling after user click or computer auto-click
        function evalGameOver() {
            //evaluate whether game is over? either tie or 1 win
            //translate image names into 3 number sequence for check and circle
            var circles = []; var checks = []; vm.blanks = [];
            for (var idx = 0; idx < 9; idx++) {
                if (vm.imageName[idx] === 'check.jpg')
                    checks.push(idx);
                else if (vm.imageName[idx] === 'circle.jpg')
                    circles.push(idx);
                else if (vm.imageName[idx] === 'blank.png')
                    vm.blanks.push(idx);
            }

            //game over condition 1 - wining seq appear in either array
            for (var ws_idx = 0; ws_idx < WINNING_SEQUENCES.length; ws_idx++) {
                //compare each element inside winning seq
                if (isMatched(checks, WINNING_SEQUENCES[ws_idx])) { //first player wins
                    vm.dlgImgVisible = true;
                    if (vm.onePlayer) {
                        if (vm.player1Symbol === "check.jpg")
                            vm.dlgImage = "you-win.jpeg";
                        else
                            vm.dlgImage = "i-win.jpeg";
                    }
                    else
                        vm.dlgImage = "player1-win.jpg";
                    vm.currentPlayer = 0;
                    return;
                }
                else if (isMatched(circles, WINNING_SEQUENCES[ws_idx])) {//2nd player wins
                    vm.dlgImgVisible = true;
                    if (vm.onePlayer) {
                        if (vm.player1Symbol === "circle.jpg")
                            vm.dlgImage = "you-win.jpeg";
                        else
                            vm.dlgImage = "i-win.jpeg";
                    }
                    else
                        vm.dlgImage = "player2-win.png";
                    vm.currentPlayer = 0;
                    return;
                }
            }

            //game over 2 - tie condition w only 1 blank cell
            var count = 0;
            for (var idx1 = 0; idx1 < 9; idx1++)
                if (vm.imageName[idx1] === 'blank.png')
                    count++;
            if (count === 1) {//tie
                vm.dlgImgVisible = true;
                vm.dlgImage = "game-over.jpg";
                vm.currentPlayer = 0;
            }
        }
}]);

//given a 3 number sequence(seq), find if there's a match in provided array(ary)
function isMatched(ary, seq) {
    for (var seq_idx = 0; seq_idx < seq.length; seq_idx++) {
        var char = seq[seq_idx];
        //find in ary
        var found = false;
        for (var ary_idx = 0; ary_idx < ary.length; ary_idx++) {
            if (char === ary[ary_idx]) {
                found = true;
                break;
            }
        }
        if (!found)
            return false;//any one in seq not found, done
    }
    return true;//all found
}

//winning sequences
const WINNING_SEQUENCES = [
    [0,1,2], [3,4,5], [6,7,8], [0,3,6], [1,4,7], [2,5,8], [0,4,8], [2,4,6]
];
