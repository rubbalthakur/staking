"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { FaSearch, FaUser } from "react-icons/fa";
import { createStakingPool } from "../utils/contract"; // Import the smart contract function

export default function CreateStakingPoolPage() {
  const [totalPool, setTotalPool] = useState("");
  const [interestRate, setInterestRate] = useState("");
  const [stakingDays, setStakingDays] = useState("");
  const [minStaking, setMinStaking] = useState("");
  const [maxStaking, setMaxStaking] = useState("");

  const handleCreateStakingPool = async () => {
    if (
      !totalPool ||
      !interestRate ||
      !stakingDays ||
      !minStaking ||
      !maxStaking ||
      isNaN(Number(totalPool)) ||
      isNaN(Number(interestRate)) ||
      isNaN(Number(stakingDays)) ||
      isNaN(Number(minStaking)) ||
      isNaN(Number(maxStaking))
    ) {
      alert("Please enter valid numbers for all fields");
      return;
    }

    try {
      // Call the `createStakingPool` function
      await createStakingPool(
        Number(totalPool),
        Number(interestRate),
        Number(stakingDays),
        Number(minStaking),
        Number(maxStaking)
      );
      alert("Staking pool created successfully!");
    } catch (error) {
      console.error("Error creating staking pool:", error);
      alert(
        "Failed to create staking pool. Please check the console for details."
      );
    }
  };

  return (
    <div className="buytokenhere">
      <header className="bg-white shadow-md">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="logo">
            <Link href="/">
              <Image
                src="/images/logo.png"
                alt="BetX"
                width={120}
                height={50}
              />
            </Link>
          </div>
          <nav className="main-nav">
            <ul className="flex space-x-6">
              <li>
                <Link href="http://localhost:3000/">Home</Link>
              </li>
              <li>
                <Link href="/ViewStakings">Stakings</Link>
              </li>
              <li>
                <Link href="/WithdrawlHistory">WithDrawls</Link>
              </li>
              <li>
                <Link href="/CreateStakingPool" className="active">
                  Create Staking Pool
                </Link>
              </li>
            </ul>
          </nav>
          <div className="header-right flex items-center space-x-4">
            <div className="search-icon text-xl cursor-pointer">
              <FaSearch />
            </div>
            <div className="user-icon text-xl cursor-pointer">
              <FaUser />
            </div>
            <div className="sign-buttons flex space-x-2">
              <Link
                href="/signin"
                className="sign-in bg-blue-500 text-white px-4 py-2 rounded"
              >
                Connect wallet
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="buy-page">
        <h1>Create Staking Pool</h1>
        <input
          type="number"
          placeholder="Total Pool (tokens)"
          value={totalPool}
          onChange={(e) => setTotalPool(e.target.value)}
        />
        <input
          type="number"
          placeholder="Interest Rate (%)"
          value={interestRate}
          onChange={(e) => setInterestRate(e.target.value)}
        />
        <input
          type="number"
          placeholder="Staking Days"
          value={stakingDays}
          onChange={(e) => setStakingDays(e.target.value)}
        />
        <input
          type="number"
          placeholder="Minimum Staking (tokens)"
          value={minStaking}
          onChange={(e) => setMinStaking(e.target.value)}
        />
        <input
          type="number"
          placeholder="Maximum Staking (tokens)"
          value={maxStaking}
          onChange={(e) => setMaxStaking(e.target.value)}
        />
        <button onClick={handleCreateStakingPool}>Create Staking Pool</button>
      </div>
    </div>
  );
}
