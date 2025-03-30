"use client";

import Link from "next/link";
import Image from "next/image";
import { FaSearch, FaUser } from "react-icons/fa";
import { useState, useEffect } from "react";
import { fetchAllStakingPools, enterStakingPool } from "../app/utils/contract";

interface StakingPool {
  id: number;
  totalPool: string;
  interestRate: number;
  stakingDays: number;
  minStaking: string;
  maxStaking: string;
}

export default function Home() {
  const [stakingPools, setStakingPools] = useState<StakingPool[]>([]);
  const [loading, setLoading] = useState(true);
  const [inputs, setInputs] = useState<{
    [key: number]: { entry: string; referrer: string };
  }>({});

  const handleInputChange = (
    poolId: number,
    field: "entry" | "referrer",
    value: string
  ) => {
    setInputs((prev) => ({
      ...prev,
      [poolId]: {
        ...prev[poolId],
        [field]: value,
      },
    }));
  };

  const handleEntry = async (poolId: number) => {
    const poolInputs = inputs[poolId];
    if (!poolInputs?.entry || !poolInputs?.referrer) {
      alert("Please enter an amount to stake and a referrer address!");
      return;
    }

    try {
      await enterStakingPool(
        poolId,
        parseFloat(poolInputs.entry),
        poolInputs.referrer
      );
      alert(
        `Successfully entered Pool ID ${poolId} with ${poolInputs.entry} tokens!`
      );
    } catch (error: any) {
      console.error("Error entering staking pool:", error.message || error);
      alert(
        error.message ||
          "Failed to enter the staking pool. Check console for details."
      );
    }
  };

  useEffect(() => {
    const loadStakingPools = async () => {
      try {
        const data = await fetchAllStakingPools();
        console.log("Staking Pools:", data);
        setStakingPools(data);
      } catch (error) {
        console.error("Error fetching staking pools:", error);
      } finally {
        setLoading(false);
      }
    };
    loadStakingPools();
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
                <Link href="/" className="active">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/ViewStakings">View Stakings</Link>
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

      {/* Staking Pools Section */}
      <div className="lottery-container">
        <h2>Active Staking Pools</h2>
        {loading ? (
          <p>Loading...</p>
        ) : stakingPools.length === 0 ? (
          <p>No active staking pools found.</p>
        ) : (
          <ul className="lottery-list">
            {stakingPools.map((pool) => (
              <li className="lottery-item" key={pool.id}>
                <p className="lottery-id">
                  ID: <span>{pool.id}</span>
                </p>
                <p className="lottery-prize">
                  Total Pool: <span>{pool.totalPool} Tokens</span>
                </p>
                <p className="lottery-prize">
                  Interest Rate: <span>{pool.interestRate}%</span>
                </p>
                <p className="lottery-prize">
                  Staking Duration: <span>{pool.stakingDays} Days</span>
                </p>
                <p className="lottery-prize">
                  Min Staking: <span>{pool.minStaking} Tokens</span>
                </p>
                <p className="lottery-prize">
                  Max Staking: <span>{pool.maxStaking} Tokens</span>
                </p>
                <label style={{ color: "white" }}>Staking Amount</label>
                <input
                  type="number"
                  placeholder="Enter amount to stake"
                  value={inputs[pool.id]?.entry || ""}
                  onChange={(e) =>
                    handleInputChange(pool.id, "entry", e.target.value)
                  }
                  className="stake-input"
                  style={{
                    border: "2px solid green",
                    borderRadius: "5px",
                    padding: "5px",
                    color: "green",
                  }}
                />
                <label style={{ color: "white" }}>Referrer Address</label>
                <input
                  type="string"
                  placeholder="Enter referrer address"
                  value={inputs[pool.id]?.referrer || ""}
                  onChange={(e) =>
                    handleInputChange(pool.id, "referrer", e.target.value)
                  }
                  className="stake-input"
                  style={{
                    border: "2px solid green",
                    borderRadius: "5px",
                    padding: "5px",
                    color: "green",
                  }}
                />
                <button
                  className="enter-button"
                  onClick={() => handleEntry(pool.id)}
                >
                  Stake in Pool
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
      <style jsx>{`
        .lottery-container {
          padding: 20px;
        }

        .lottery-list {
          display: flex;
          flex-wrap: wrap;
          gap: 20px;
          list-style: none;
          padding: 0;
          justify-content: center;
        }

        .lottery-item {
          background: #111827;
          border-radius: 8px;
          padding: 20px;
          min-width: 300px;
          flex: 1 1 300px;
          box-sizing: border-box;
          display: flex;
          flex-direction: column;
        }

        .lottery-id,
        .lottery-prize {
          color: white;
          margin-bottom: 8px;
        }

        .lottery-id span,
        .lottery-prize span {
          color: #4caf50;
        }

        .stake-input {
          width: 100%;
          margin-bottom: 10px; /* Add margin here */
          padding: 8px;
          border: 2px solid green;
          border-radius: 5px;
          color: green;
          background-color: #1f2937;
        }

        .enter-button {
          background-color: #4caf50;
          color: white;
          padding: 10px 15px;
          border: none;
          border-radius: 5px;
          cursor: pointer;
          width: 100%;
          margin-top: 10px; /* Add margin here */
        }
      `}</style>
    </div>
  );
}
