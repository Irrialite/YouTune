function IpriCtrl($scope, Team, Student) {
    $scope.teams = Team.query();
    $scope.students = Student.query();
}
