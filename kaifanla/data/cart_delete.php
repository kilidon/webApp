<?php
@$uid = $_REQUEST['uid'] or die('uid required');
@$did = $_REQUEST['did'] or die('did required');
require('init.php');
$sql = "DELETE FROM kf_cart WHERE userid=$uid AND did=$did";
$result = mysqli_query($conn,$sql);
if($result){
echo 'succ';
}