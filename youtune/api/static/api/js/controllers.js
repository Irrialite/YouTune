function YouTuneCtrl($scope, User) {
    $scope.users = User.query();
    console.log($scope.users);
}
