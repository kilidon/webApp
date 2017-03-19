/**
 * Created by zhangzidong on 2017/3/16.
 */
var app=angular.module('myApp',['ionic']);
// 自定义服务
app.service('$kflHttp',['$http','$ionicLoading',function ($http,$ionicLoading) {
  this.sendRequest=function (url,successCallback) {
    $ionicLoading.show({
      template:'loading....'
    });
    $http.get(url).success(function (data) {
      $ionicLoading.hide();
      successCallback(data);
    });
  }
}]);
app.config(function ($stateProvider,$urlRouterProvider,$ionicConfigProvider) {
  $ionicConfigProvider.tabs.position('bottom');
  $stateProvider.state('start',{
    url:'/kfl_start',
    templateUrl:'tpl/start.html',
    controller:'startCtrl'
  }).state('main',{
    url:'/kfl_main',
    templateUrl:'tpl/main.html',
    controller:'mainCtrl'
  }).state('detail',{
    url:'/kfl_detail/:did',
    templateUrl:'tpl/detail.html',
    controller:'detailCtrl'
  }).state('order',{
    url:'/kfl_order/:cartData',
    templateUrl:'tpl/order.html',
    controller:'orderCtrl'
  }).state('myorder',{
    url:'/kfl_myorder',
    templateUrl:'tpl/myorder.html',
    controller:'myorderCtrl'
  }).state('setting',{
    url:'/kfl_setting',
    templateUrl:'tpl/setting.html',
    controller:'settingCtrl'
  }).state('myCart',{
    url:'/kfl_myCart',
    templateUrl:'tpl/myCart.html',
    controller:'myCartCtrl'
  });
  $urlRouterProvider.otherwise('/kfl_start');
});


app.controller('startCtrl',['$scope','$kflHttp',function ($scope,$kflHttp) {
}]);


app.controller('parentCtrl',['$scope','$state','$kflHttp','$ionicTabsDelegate',function ($scope,$state,$kflHttp,$ionicTabsDelegate) {
  $kflHttp.sendRequest('data/cart_select.php?uid=1',function (data) {
    $scope.cartCount=data.data.length;
  });
  $scope.jump=function (desState,obj) {
    $state.go(desState,obj);
  };
  $scope.tabJump=function (desState,index) {
    $ionicTabsDelegate.select(index);
    $state.go(desState);
  }
}]);


app.controller('mainCtrl',['$scope','$kflHttp',function ($scope,$kflHttp) {
  $scope.hasMore=true;
  $scope.info={kw:''};
  $kflHttp.sendRequest('data/dish_getbypage.php',function (data) {
    $scope.dishList=data;
  });
  $scope.loadMore=function () {
    $kflHttp.sendRequest('data/dish_getbypage.php?start='+$scope.dishList.length,function (data) {
      if(data.length<5){
        $scope.hasMore=false;
      }
      $scope.dishList=$scope.dishList.concat(data);
      $scope.$broadcast('scroll.infiniteScrollCoplete')
    });
  };
  $scope.$watch('info.kw',function () {
      if($scope.info.kw){
        $kflHttp.sendRequest('data/dish_getbykw.php?kw='+$scope.info.kw,function (data) {
          if(data.length>0){
            $scope.dishList=data;
          }
        });
      }
  });

}]);


app.controller('detailCtrl',['$scope','$kflHttp','$stateParams','$ionicPopup',function ($scope,$kflHttp,$stateParams,$ionicPopup) {
  $kflHttp.sendRequest('data/dish_getbyId.php?id='+$stateParams.did,function (data) {
    $scope.dish=data[0];
  });
  $scope.addToCart=function () {
    $kflHttp.sendRequest('data/cart_update.php?uid=1&did='+$scope.dish.did+'&count=-1',function (data) {
      if(data.msg=='succ'){
        $ionicPopup.alert({
          title:'添加成功'
        })
      };
      $kflHttp.sendRequest('data/cart_select.php?uid=1',function (data) {
        $scope.cartCount=data.data.length;
      });
    })
  }
}]);


app.controller('orderCtrl',['$scope','$kflHttp','$stateParams','$httpParamSerializerJQLike',function ($scope,$kflHttp,$stateParams,$httpParamSerializerJQLike) {
  $scope.order={cartDetail:$stateParams.cartData};
  console.log($stateParams.cartData);
  $scope.submitOrder=function () {
    var result=$httpParamSerializerJQLike($scope.order);
    $kflHttp.sendRequest('data/order_add.php?'+result,function (data) {
      if(data.length>0){
        if(data[0].msg=='succ'){
          sessionStorage['phone']=$scope.order.phone;
          $scope.requestResult='添加成功，订单号为'+data[0].oid
        }else{
          $scope.requestResult='添加失败'
        }
      }
    })
  };
  // $kflHttp.sendRequest('data/order_add.php')
}]);


app.controller('myorderCtrl',['$scope','$kflHttp',function ($scope,$kflHttp) {
  $kflHttp.sendRequest('data/order_getbyuserid.php?userid=1',function (data) {
    $scope.dishList=data.data;
  })
}]);


app.controller('settingCtrl',['$scope','$ionicModal',function ($scope,$ionicmodal) {
  $scope.infoList=[
    {name:'开发者',value:'web1611'},
    {name:'版本号',value:'v1.0'},
    {name:'email',value:'kkk@kkk.com'}
    ];
  $ionicmodal.fromTemplateUrl('tpl/modal/aboutUs.html',{
    scope:$scope,
    animation:'slide-in-up'
  }).then(function (modal) {
    $scope.modal=modal;
  });
  $scope.openModal=function () {
    $scope.modal.show();
  };
  $scope.closeModal=function () {
    $scope.modal.hide();
  }
}]);


app.controller('myCartCtrl',['$scope','$kflHttp','$ionicPopup','$httpParamSerializerJQLike',function ($scope,$kflHttp,$ionicPopup,$httpParamSerializerJQLike) {
  $scope.editShowMsg='编辑';
  $scope.editEnable=false;
  $scope.funcToggleEdit=function () {
    $scope.editEnable=!$scope.editEnable;
    if($scope.editEnable){
      $scope.editShowMsg='完成';
    }else{
      $scope.editShowMsg='编辑';
    }
  };

  $kflHttp.sendRequest('data/cart_select.php?uid=1',function (data) {
    $scope.dishList=data.data;
    $scope.uid=data.uid;
    $scope.resultList=$httpParamSerializerJQLike($scope.dishList);
    console.log($scope.resultList);
  });
  $scope.cartDelete=function (index) {
    $kflHttp.sendRequest('data/cart_delete.php?uid='+$scope.uid+'&did='+$scope.dishList[index].did,function (data) {
      if(data=='succ'){
        $ionicPopup.alert({title:'删除成功'});
        $scope.cartCount--;
        $kflHttp.sendRequest('data/cart_select.php?uid=1',function (data) {
          $scope.dishList=data.data;
          $scope.uid=data.uid;
        });
      }
    })
  };
  $scope.addCount=function (index) {
    $scope.dishList[index].dishCount++;
    $scope.updataToSever($scope.dishList[index].did,$scope.dishList[index].dishCount)
  };
  $scope.reduceCount=function (index) {
    if($scope.dishList[index].dishCount<=1){
      $scope.dishList[index].dishCount=1;
    }else{
      $scope.dishList[index].dishCount--;
    }
    $scope.updataToSever($scope.dishList[index].did,$scope.dishList[index].dishCount)
  };
  $scope.updataToSever=function (did,count) {
    $kflHttp.sendRequest('data/cart_update.php?uid='+$scope.uid+'&did='+did+'&count='+count,function (data) {
    })
  };
  $scope.sum=function () {
    var result=0;
    angular.forEach($scope.dishList,function (value,key) {
      result+=value.dishCount*value.price;
    });
    return result;
  }
}]);