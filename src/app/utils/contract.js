import { ethers } from "ethers";

const tokenContractAddress = "0xBFb80C9FE1e3c36e170628574f6EEc6aFB556077";
const PUBLIC_RPC_URL = "https://rpc-amoy.polygon.technology";
const provider = new ethers.JsonRpcProvider(PUBLIC_RPC_URL);

const myTokenABI = [
  "event StakingPoolCreated( uint256 indexed stakingId, uint256 totalPool, uint256 interestRate, uint256 stakingDays, uint256 minStaking, uint256 maxStaking )",
  "event Staked( uint256 indexed stakingId, address indexed staker, uint256 amount, uint256 interestRate, uint256 timeStamp, address referrer )",
  "event Withdrawn( uint256 indexed stakingId, address indexed staker, uint256 stakedAmount, uint256 interest )",
  "function owner() view returns (address)",
  "function stakingPoolCounter() view returns (uint256)",
  "function approve(address spender, uint256 amount) public returns (bool)",
  "function createStakingPool( uint256 _totalPool, uint256 _interestRate, uint256 _stakingDays, uint256 _minStaking, uint256 _maxStaking ) external",
  "function enterStaking(uint256 _stakingId, uint256 _amount, address _referrer) external",
  "function withdrawAmount(uint256 _stakingId) external",
  "function getStakingPoolData(uint256 _stakingId) public view returns ( uint256, uint256, uint256, uint256, uint256, uint256, uint256 )",
];

export const getContract = () => {
  return new ethers.Contract(tokenContractAddress, myTokenABI, provider);
};

//------------------------Get Owner Address----------------------------
export const getOwnerAddress = async () => {
  try {
    const contract = getContract();
    const ownerAddress = await contract.owner();
    console.log("Owner Address:", ownerAddress);
    return ownerAddress;
  } catch (error) {
    console.error("Error fetching owner address:", error);
    return null;
  }
};

//---------------------Fetch Staking Pool Counter---------------------
export const getStakingPoolCounter = async () => {
  try {
    const contract = getContract();
    const stakingCounter = await contract.stakingPoolCounter();
    console.log("Staking Counter:", stakingCounter.toString());
    return stakingCounter.toString();
  } catch (error) {
    console.error("Error fetching staking counter:", error);
    return null;
  }
};

//---------------------staking info---------------------
export const getStakingPoolInfo = async (stakingId) => {
  try {
    const contract = getContract();
    const stakingPool = await contract.getStakingPoolData(stakingId);

    const formattedPoolData = {
      id: stakingPool.id.toString(),
      interestRate: stakingPool.interestRate.toString(),
      totalPool: ethers.utils.formatUnits(stakingPool.totalPool, 18),
      totalCollection: ethers.utils.formatUnits(
        stakingPool.totalCollection,
        18
      ),
      stakingDays: stakingPool.stakingDays.toString(),
      minStaking: ethers.utils.formatUnits(stakingPool.minStaking, 18),
      maxStaking: ethers.utils.formatUnits(stakingPool.maxStaking, 18),
    };
    console.log("Staking Info:", formattedPoolData);
    return formattedPoolData;
  } catch (error) {
    console.error("Error fetching staking info:", error);
    return null;
  }
};

//------------------------Get All Staking Pools created----------------------------
export const fetchAllStakingPools = async (previousBlock = 19191172) => {
  try {
    const contract = getContract();
    const latestBlock = await provider.getBlockNumber();
    const eventFilter = contract.filters.StakingPoolCreated();
    const events = await contract.queryFilter(
      eventFilter,
      previousBlock,
      latestBlock
    );

    const iface = new ethers.Interface(myTokenABI);
    const pools = events
      .map((event) => {
        if (!event.data) {
          console.warn("Skipping event due to missing data:", event);
          return null;
        }

        const decoded = iface.decodeEventLog(
          "StakingPoolCreated",
          event.data,
          event.topics
        );

        return {
          id: Number(decoded[0]),
          totalPool: ethers.formatUnits(decoded[1], 18),
          interestRate: Number(decoded[2]),
          stakingDays: Number(decoded[3]),
          minStaking: ethers.formatUnits(decoded[4], 18),
          maxStaking: ethers.formatUnits(decoded[5], 18),
        };
      })
      .filter((pool) => pool !== null);
    console.log("Staking Pools Data", pools);
    return pools;
  } catch (error) {
    console.error("Error fetching staking pools:", error);
    return [];
  }
};

export const fetchStakings = async (previousBlock = 19191172) => {
  try {
    const contract = getContract();
    const latestBlock = await provider.getBlockNumber();
    const eventFilter = contract.filters.Staked();
    const events = await contract.queryFilter(
      eventFilter,
      previousBlock,
      latestBlock
    );

    const iface = new ethers.Interface(myTokenABI);
    const stakings = events
      .map((event) => {
        if (!event.data) {
          console.warn("Skipping event due to missing data:", event);
          return null;
        }

        const decoded = iface.decodeEventLog(
          "Staked",
          event.data,
          event.topics
        );
        const timeStampInSeconds = Number(decoded[4]); // Updated timestamp position
        const dateTime = new Date(timeStampInSeconds * 1000).toISOString();

        return {
          id: Number(decoded[0]), // Staking ID
          staker: String(decoded[1]), // Staker address
          amount: parseFloat(ethers.formatUnits(decoded[2], 18)), // Staked amount
          interestRate: Number(decoded[3]), // Interest rate as a percentage
          timeStamp: dateTime,
          referrer: String(decoded[5]),
        };
      })
      .filter((staking) => staking !== null);

    console.log("Staking Data", stakings);
    return stakings;
  } catch (error) {
    console.error("Error fetching stakings:", error);
    return [];
  }
};

//---------------------Fetch Stakings By Participant Address---------------------
export const fetchStakingsByParticipant = async () => {
  try {
    const provider = getProvider();
    const signer = await provider.getSigner();
    const participant = await signer.getAddress();

    const stakings = (await fetchStakings()).filter(
      (staking) => staking.staker.toLowerCase() === participant.toLowerCase()
    );
    console.log("Staking By participant Data", stakings);
    return stakings;
  } catch (error) {
    console.error("Error fetching stakings entered by participant:", error);
    alert("Error fetching stakings entered by participant");
    throw new Error("Error fetching stakings entered by participant:", error);
  }
};

//---------------------Fetch Withdrawn Events---------------------
export const fetchWithdrawnEvents = async (previousBlock = 19191172) => {
  try {
    const contract = getContract();
    const latestBlock = await provider.getBlockNumber();

    const eventFilter = contract.filters.Withdrawn();

    const events = await contract.queryFilter(
      eventFilter,
      previousBlock,
      latestBlock
    );

    const iface = new ethers.Interface(myTokenABI);

    const withdrawals = events
      .map((event) => {
        if (!event.data) {
          console.warn("Skipping event due to missing data:", event);
          return null;
        }

        const decoded = iface.decodeEventLog(
          "Withdrawn",
          event.data,
          event.topics
        );

        return {
          stakingId: Number(decoded[0]),
          staker: String(decoded[1]),
          stakedAmount: ethers.formatUnits(decoded[2], 18),
          interest: ethers.formatUnits(decoded[3], 18),
        };
      })
      .filter((withdrawal) => withdrawal !== null);

    console.log("Withdrawn Events Data", withdrawals);
    return withdrawals;
  } catch (error) {
    console.error("Error fetching Withdrawn events:", error);
    return [];
  }
};

//---------------------Browser provider---------------------
export const getProvider = () => {
  if (typeof window !== "undefined" && window.ethereum) {
    try {
      return new ethers.BrowserProvider(window.ethereum);
    } catch (error) {
      console.error("Error initializing provider:", error);
      throw new Error("Error initializing provider:", error);
    }
  } else {
    console.error("MetaMask not detected!");
    alert("MetaMask not detected!");
    return null;
  }
};

//---------------------MyToken Contract---------------------
export const getMyTokenContract = async () => {
  const provider = getProvider();
  if (!provider) return null;

  const signer = await provider.getSigner();
  return new ethers.Contract(tokenContractAddress, myTokenABI, signer);
};

//---------------------Approve MyToken---------------------
export const approveMyToken = async (amount) => {
  try {
    if (!amount) {
      console.error("Amount is undefined or empty!");
      throw new Error("Amount is undefined or empty!");
    }

    const myTokenContract = await getMyTokenContract(); // Now it uses a signer
    if (!myTokenContract) return;

    const amountInWei = ethers.parseUnits(amount.toString(), 18); // For ethers v6
    const tx = await myTokenContract.approve(tokenContractAddress, amountInWei);
    await tx.wait();

    console.log("Approval successful!");
  } catch (error) {
    console.error("Approval failed:", error);
    throw new Error("Approval failed:", error);
  }
};

//---------------------Create Staking Pool---------------------
export const createStakingPool = async (
  totalPool,
  interestRate,
  stakingDays,
  minStaking,
  maxStaking
) => {
  try {
    if (
      !totalPool ||
      !interestRate ||
      !stakingDays ||
      !minStaking ||
      !maxStaking
    ) {
      console.error("prize is undefined or empty!");
      throw new Error("prize is undefined or empty!");
    }

    const myTokenContract = await getMyTokenContract();
    if (!myTokenContract) return;

    const totalPoolInWei = ethers.parseUnits(totalPool.toString(), 18);
    const minStakingInWei = ethers.parseUnits(minStaking.toString(), 18);
    const maxStakingInWei = ethers.parseUnits(maxStaking.toString(), 18);
    const tx = await myTokenContract.createStakingPool(
      totalPoolInWei,
      interestRate,
      stakingDays,
      minStakingInWei,
      maxStakingInWei
    );
    await tx.wait();

    console.log("Staking Pool Created!");
  } catch (error) {
    console.error("Staking Pool creation failed:", error);
    throw new Error("Staking Pool creation failed:", error);
  }
};

//---------------------Enter Staking Pool---------------------
export const enterStakingPool = async (stakingId, amount, referrer) => {
  try {
    if (!stakingId || !amount) {
      throw new Error("Staking ID or amount is undefined or empty!");
    }

    const myTokenContract = await getMyTokenContract();
    if (!myTokenContract) return;

    const amountInWei = ethers.parseUnits(amount.toString(), 18);
    const tx = await myTokenContract.enterStaking(
      stakingId,
      amountInWei,
      referrer
    );
    await tx.wait();

    console.log("amount staked!");
  } catch (error) {
    console.log("Staking failed:", error);
    throw new Error("Staking failed:", error);
  }
};

//---------------------Withdraw Amount---------------------
export const withdrawAmount = async (stakingId) => {
  try {
    if (!stakingId) {
      console.error("stakingId is undefined or empty!");
      return;
    }

    const myTokenContract = await getMyTokenContract();
    if (!myTokenContract) return;

    const tx = await myTokenContract.withdrawAmount(stakingId);
    await tx.wait();

    console.log("Amount Withrawn!");
  } catch (error) {
    console.error("Withdrawl failed:", error);
    throw new Error("Withdrawl failed:", error);
  }
};
