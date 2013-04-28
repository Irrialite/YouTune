function YouTuneCtrl($scope, User) {
    $scope.users = User.query();
}
