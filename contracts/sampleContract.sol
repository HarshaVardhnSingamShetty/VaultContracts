// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;
import "hardhat/console.sol";

contract Sample{

    function foo()  public {
        console.log(msg.sender);
        bar();
    }
    function bar()  public{
        console.log("in bar, msg.sender", msg.sender);
        Test t = new Test();
        t.test();
        
    }

}
contract Test {
    function test() view public{
        console.log("in test, msg.sender", msg.sender);
        
    }
}
contract Test2 is Sample {
    function test2() public{
        console.log("in test2, msg.sender", msg.sender);
        foo();
        
    }
}
