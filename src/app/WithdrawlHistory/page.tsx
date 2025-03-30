"use client";

import Link from "next/link";
import Image from "next/image";
import { FaSearch, FaUser } from "react-icons/fa";
import { useState, useEffect } from "react";
import { fetchWithdrawnEvents } from "../utils/contract";

interface WithdrawnEntry {
  stakingId: number;
  staker: string;
  stakedAmount: string;
  interest: string;
}

export default function WithdrawnEventsPage() {
  const [withdrawnEntries, setWithdrawnEntries] = useState<WithdrawnEntry[]>(
    []
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadWithdrawnEntries = async () => {
      try {
        const data = await fetchWithdrawnEvents();
        console.log("Withdrawn Events:", data);
        setWithdrawnEntries(data);
      } catch (error) {
        console.error("Error fetching withdrawn events:", error);
      } finally {
        setLoading(false);
      }
    };

    loadWithdrawnEntries();
  }, []);

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
                <Link href="/ViewStakings">Stakings</Link>
              </li>
              <li>
                <Link href="/WithdrawlHistory" className="active">
                  WithDrawls
                </Link>
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

      {/* Withdrawn Events Section */}
      <div className="lottery-container">
        <h2>Withdrawn Events</h2>
        {loading ? (
          <p>Loading...</p>
        ) : withdrawnEntries.length === 0 ? (
          <p>No withdrawn events found.</p>
        ) : (
          <ul className="lottery-list">
            {withdrawnEntries.map((entry) => (
              <li className="lottery-item" key={entry.stakingId}>
                <p className="lottery-id">
                  Staking ID: <span>{entry.stakingId}</span>
                </p>
                <p className="lottery-prize">
                  Staker:{" "}
                  <span>
                    {entry.staker && entry.staker.length > 6
                      ? `${entry.staker.substring(
                          0,
                          3
                        )}...${entry.staker.substring(entry.staker.length - 3)}`
                      : entry.staker}
                  </span>
                </p>
                <p className="lottery-prize">
                  Staked Amount: <span>{entry.stakedAmount} Tokens</span>
                </p>
                <p className="lottery-prize">
                  Interest Earned: <span>{entry.interest} Tokens</span>
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
