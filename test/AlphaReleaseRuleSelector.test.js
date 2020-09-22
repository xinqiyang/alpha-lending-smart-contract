const {assert} = require("chai");

const AlphaReleaseRule = artifacts.require("AlphaReleaseRule");
const AlphaReleaseRuleSelector = artifacts.require("AlphaReleaseRuleSelector");
const AlphaToken = artifacts.require("AlphaToken");
const MockReceiver = artifacts.require("MockAlphaReceiver");

contract("AlphaReleaseRuleSelector", ([creator, alice, bob]) => {
  beforeEach(async () => {
    this.alphaToken = await AlphaToken.new(100000000000);

    this.rule1 = await AlphaReleaseRule.new(20, 10, [10, 8, 6]);
    this.rule2 = await AlphaReleaseRule.new(10, 10, [10, 8, 6, 4, 2]);
    this.rule3 = await AlphaReleaseRule.new(20, 10, [10, 8, 6, 4, 2, 1]);

    this.receiver1 = await MockReceiver.new(this.alphaToken.address);
    this.receiver2 = await MockReceiver.new(this.alphaToken.address);
    this.receiver3 = await MockReceiver.new(this.alphaToken.address);

    this.selector = await AlphaReleaseRuleSelector.new();
  });

  it("Should add rule and set rule to the receiver correctly", async () => {
    // Add rule#1
    await this.selector.setAlphaReleaseRule(this.receiver1.address, this.rule1.address);
    assert.equal((await this.selector.receiverList.call(0)).valueOf(), this.receiver1.address);
    assert.equal(
      (await this.selector.rules.call(this.receiver1.address)).valueOf(),
      this.rule1.address
    );

    // Add rule#2
    await this.selector.setAlphaReleaseRule(this.receiver2.address, this.rule2.address);
    assert.equal((await this.selector.receiverList.call(1)).valueOf(), this.receiver2.address);
    assert.equal(
      (await this.selector.rules.call(this.receiver2.address)).valueOf(),
      this.rule2.address
    );

    assert.equal((await this.selector.receiverCount.call()).valueOf(), "2");
  });

  it("Should add rule and set rule to the receiver correctly (remove first element)", async () => {
    // Add rule#1, #2 and #3
    await this.selector.setAlphaReleaseRule(this.receiver1.address, this.rule1.address);
    await this.selector.setAlphaReleaseRule(this.receiver2.address, this.rule2.address);
    await this.selector.setAlphaReleaseRule(this.receiver3.address, this.rule3.address);

    // Remove receiver#1
    await this.selector.removeAlphaReleaseRule(this.receiver1.address);
    // receiver#3 replace #1
    assert.equal((await this.selector.receiverList.call(0)).valueOf(), this.receiver3.address);
    assert.equal((await this.selector.receiverList.call(1)).valueOf(), this.receiver2.address);

    assert.equal((await this.selector.receiverCount.call()).valueOf(), "2");
  });

  it("Should add rule and set rule to the receiver correctly (remove last element)", async () => {
    // Add rule#1, #2 and #3
    await this.selector.setAlphaReleaseRule(this.receiver1.address, this.rule1.address);
    await this.selector.setAlphaReleaseRule(this.receiver2.address, this.rule2.address);
    await this.selector.setAlphaReleaseRule(this.receiver3.address, this.rule3.address);

    // Remove receiver#3
    await this.selector.removeAlphaReleaseRule(this.receiver3.address);
    assert.equal((await this.selector.receiverList.call(0)).valueOf(), this.receiver1.address);
    assert.equal((await this.selector.receiverList.call(1)).valueOf(), this.receiver2.address);

    assert.equal((await this.selector.receiverCount.call()).valueOf(), "2");
  });

  it("Should add rule and set rule to the receiver correctly (remove middle element)", async () => {
    // Add rule#1, #2 and #3
    await this.selector.setAlphaReleaseRule(this.receiver1.address, this.rule1.address);
    await this.selector.setAlphaReleaseRule(this.receiver2.address, this.rule2.address);
    await this.selector.setAlphaReleaseRule(this.receiver3.address, this.rule3.address);

    // Remove receiver#2
    await this.selector.removeAlphaReleaseRule(this.receiver2.address);
    assert.equal((await this.selector.receiverList.call(0)).valueOf(), this.receiver1.address);
    assert.equal((await this.selector.receiverList.call(1)).valueOf(), this.receiver3.address);

    assert.equal((await this.selector.receiverCount.call()).valueOf(), "2");
  });
});
