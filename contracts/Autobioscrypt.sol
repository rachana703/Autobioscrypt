pragma solidity ^0.4.18;

contract Autobioscrypt {
    
   string content;
   string userid;
   
   function setInstructor(string _content, string _userid) public {
       content = _content;
       userid = _userid;

   }
   
   function getInstructor() public constant returns (string) {
       return(userid);
   }
    
}