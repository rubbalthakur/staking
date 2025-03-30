"use client";

import Link from "next/link";
import Image from "next/image";
import { FaSearch, FaUser } from "react-icons/fa";
import { useState, useEffect } from "react";
import { fetchStakings, withdrawAmount } from "../utils/contract";

interface StakingEntry {
  id: number;
  staker: string;
  amount: number;
  interestRate: number;
  timeStamp: string;
}

export default function Home() {
  const [stakingEntries, setStakingEntries] = useState<StakingEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [withdrawing, setWithdrawing] = useState<number | null>(null); // Tracks the ID of the pool being withdrawn from

  useEffect(() => {
    const loadStakingEntries = async () => {
      try {
        const data = await fetchStakings(); // Fetch staking data
        console.log("Staking Data:", data);
        setStakingEntries(data);
      } catch (error) {
        console.error("Error fetching staking entries:", error);
      } finally {
        setLoading(false);
      }
    };

    loadStakingEntries();
  }, []);

  //---------------------Withdraw from Pool---------------------
  const handleWithdraw = async (poolId: number) => {
    setWithdrawing(poolId);
    try {
      await withdrawAmount(poolId);
      alert(`Successfully withdrawn from Pool ID ${poolId}!`);
      // Optionally, refresh the data after withdrawal
      const updatedEntries = await fetchStakings();
      setStakingEntries(updatedEntries);
    } catch (error: any) {
      console.error("Error during withdrawal:", error.message || error);
      alert(error.message || "Failed to withdraw. Check console for details.");
    } finally {
      setWithdrawing(null);
    }
  };

  //---------------------calculate Interest Earned---------------------
  const calculateInterestEarned = (
    amount: number,
    interestRate: number,
    timeStamp: string
  ) => {
    const stakingStartTime = new Date(timeStamp).getTime(); // Staking start time in ms
    const currentTime = Date.now(); // Current time in ms

    const elapsedTimeInDays =
      (currentTime - stakingStartTime) / (1000 * 60 * 60 * 24);
    const interestEarned = (
      (amount * interestRate * elapsedTimeInDays) /
      100
    ).toFixed(6); // Simple interest formula
    return interestEarned;
  };

  return (
    <div style={{ textAlign: "center" }}>
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
                <Link href="/">Home</Link>
              </li>
              <li>
                <Link href="/ViewStakings" className="active">
                  View Stakings
                </Link>
              </li>
              <li>
                <Link href="/WithdrawlHistory">WithDrawls</Link>
              </li>
              <li>
                <Link href="/CreatePool">Create Staking Pool</Link>
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

      {/* Staking Entries Section */}
      <div className="lottery-container">
        <h2>Staking Entries</h2>
        {loading ? (
          <p>Loading...</p>
        ) : stakingEntries.length === 0 ? (
          <p>No staking entries found.</p>
        ) : (
          <ul className="lottery-list">
            {stakingEntries.map((entry) => {
              const interestEarned = calculateInterestEarned(
                entry.amount,
                entry.interestRate,
                entry.timeStamp
              );

              return (
                <li className="lottery-item" key={entry.id}>
                  <p className="lottery-id">
                    Pool ID: <span>{entry.id}</span>
                  </p>
                  <p className="lottery-prize">
                    Staker:
                    <span>
                      {entry.staker && entry.staker.length > 6
                        ? `${entry.staker.substring(
                            0,
                            3
                          )}...${entry.staker.substring(
                            entry.staker.length - 3
                          )}`
                        : entry.staker}
                    </span>
                  </p>

                  <p className="lottery-prize">
                    Amount: <span>{entry.amount} Tokens</span>
                  </p>
                  <p className="lottery-prize">
                    Interest Rate: <span>{entry.interestRate}%</span>
                  </p>
                  <p className="lottery-prize">
                    Interest Earned: <span>{interestEarned} Tokens</span>
                  </p>
                  <p className="lottery-prize">
                    Time:{" "}
                    <span>{new Date(entry.timeStamp).toLocaleString()}</span>
                  </p>
                  <button
                    className="enter-button"
                    onClick={() => handleWithdraw(entry.id)}
                    disabled={withdrawing === entry.id}
                  >
                    {withdrawing === entry.id ? "Withdrawing..." : "Withdraw"}
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
