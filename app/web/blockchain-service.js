/**
 * VeriLens Blockchain Integration
 * Real Ethereum/Polygon blockchain integration for immutable hash storage
 */

class BlockchainService {
  constructor() {
    this.provider = null;
    this.signer = null;
    this.contract = null;
    this.network = 'polygon'; // Default to Polygon for lower fees
    this.connected = false;

    // Contract configuration
    this.contractAddress = '0x742d35Cc82165F0A6311289f5eCb5C15B0Ba6355'; // Example address
    this.contractABI = [
      'function submitImageHash(string memory imageHash, uint256 timestamp, uint256 trustScore, string memory deviceId) public returns (uint256)',
      'function verifyImageHash(string memory imageHash) public view returns (bool exists, uint256 timestamp, uint256 trustScore, string memory deviceId, address submitter)',
      'function getHashCount() public view returns (uint256)',
      'event ImageHashSubmitted(string indexed imageHash, uint256 indexed timestamp, uint256 trustScore, string deviceId, address indexed submitter)',
    ];

    this.init();
  }

  async init() {
    console.log('⛓️ Initializing Blockchain Service...');

    try {
      await this.connectProvider();
      await this.setupContract();
      console.log('✅ Blockchain service ready');
    } catch (error) {
      console.warn(
        '⚠️ Blockchain connection failed, using local fallback:',
        error.message
      );
    }
  }

  async connectProvider() {
    // Check for MetaMask or other Web3 providers
    if (window.ethereum) {
      console.log('🦊 MetaMask detected');
      this.provider = new ethers.BrowserProvider(window.ethereum);

      // Request account access
      await window.ethereum.request({ method: 'eth_requestAccounts' });

      this.signer = await this.provider.getSigner();
      this.connected = true;

      // Check network
      const network = await this.provider.getNetwork();
      console.log('🌐 Connected to network:', network.name, network.chainId);

      // Switch to Polygon if not already
      if (network.chainId !== 137n) {
        // Polygon Mainnet
        await this.switchToPolygon();
      }
    } else {
      // Use public RPC for read-only operations
      console.log('🌐 Using public RPC provider');
      this.provider = new ethers.JsonRpcProvider('https://polygon-rpc.com');
    }
  }

  async switchToPolygon() {
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: '0x89' }], // Polygon Mainnet
      });
    } catch (switchError) {
      // Add Polygon network if not found
      if (switchError.code === 4902) {
        await window.ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [
            {
              chainId: '0x89',
              chainName: 'Polygon Mainnet',
              nativeCurrency: {
                name: 'MATIC',
                symbol: 'MATIC',
                decimals: 18,
              },
              rpcUrls: ['https://polygon-rpc.com/'],
              blockExplorerUrls: ['https://polygonscan.com/'],
            },
          ],
        });
      }
    }
  }

  async setupContract() {
    if (!this.provider) {
      throw new Error('Provider not available');
    }

    // Create contract instance
    this.contract = new ethers.Contract(
      this.contractAddress,
      this.contractABI,
      this.signer || this.provider
    );

    console.log('📝 VeriLens contract loaded:', this.contractAddress);
  }

  async submitImageHash(imageHash, verification, deviceId) {
    try {
      if (!this.contract || !this.signer) {
        return this.createLocalBlockchainRecord(
          imageHash,
          verification,
          deviceId
        );
      }

      console.log(
        '📝 Submitting to blockchain:',
        imageHash.substring(0, 16) + '...'
      );

      // Prepare transaction
      const timestamp = Math.floor(Date.now() / 1000);
      const trustScore = verification.trustScore || 50;

      // Estimate gas
      const gasEstimate = await this.contract.submitImageHash.estimateGas(
        imageHash,
        timestamp,
        trustScore,
        deviceId
      );

      // Submit transaction with extra gas
      const tx = await this.contract.submitImageHash(
        imageHash,
        timestamp,
        trustScore,
        deviceId,
        {
          gasLimit: (gasEstimate * 120n) / 100n, // Add 20% buffer
        }
      );

      console.log('⏳ Transaction submitted:', tx.hash);

      // Wait for confirmation
      const receipt = await tx.wait();

      console.log('✅ Blockchain submission confirmed:', {
        hash: receipt.hash,
        blockNumber: receipt.blockNumber,
        gasUsed: receipt.gasUsed.toString(),
      });

      return {
        success: true,
        transactionHash: receipt.hash,
        blockNumber: receipt.blockNumber.toString(),
        network: 'polygon',
        gasUsed: receipt.gasUsed.toString(),
        confirmations: receipt.confirmations || 1,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error('❌ Blockchain submission failed:', error);

      // Fallback to local record
      return this.createLocalBlockchainRecord(
        imageHash,
        verification,
        deviceId,
        error.message
      );
    }
  }

  async verifyImageHash(imageHash) {
    try {
      if (!this.contract) {
        return this.verifyLocalBlockchainRecord(imageHash);
      }

      console.log(
        '🔍 Verifying on blockchain:',
        imageHash.substring(0, 16) + '...'
      );

      const result = await this.contract.verifyImageHash(imageHash);

      if (result.exists) {
        return {
          exists: true,
          timestamp: new Date(Number(result.timestamp) * 1000).toISOString(),
          trustScore: Number(result.trustScore),
          deviceId: result.deviceId,
          submitter: result.submitter,
          network: 'polygon',
          verified: true,
        };
      } else {
        return {
          exists: false,
          verified: false,
        };
      }
    } catch (error) {
      console.error('❌ Blockchain verification failed:', error);
      return this.verifyLocalBlockchainRecord(imageHash);
    }
  }

  async getBlockchainStats() {
    try {
      if (!this.contract) {
        return this.getLocalBlockchainStats();
      }

      const hashCount = await this.contract.getHashCount();
      const network = await this.provider.getNetwork();
      const block = await this.provider.getBlock('latest');

      return {
        totalHashes: hashCount.toString(),
        network: network.name,
        chainId: network.chainId.toString(),
        latestBlock: block.number.toString(),
        connected: this.connected,
        contractAddress: this.contractAddress,
      };
    } catch (error) {
      console.error('❌ Failed to get blockchain stats:', error);
      return this.getLocalBlockchainStats();
    }
  }

  // Local fallback methods for when blockchain is unavailable
  createLocalBlockchainRecord(imageHash, verification, deviceId, error = null) {
    const record = {
      success: true,
      transactionHash: 'local_' + this.generateMockTxHash(),
      blockNumber: Date.now().toString(),
      network: 'local-fallback',
      gasUsed: '0',
      confirmations: 1,
      timestamp: new Date().toISOString(),
      error: error || null,
      localFallback: true,
    };

    // Store locally
    this.storeLocalRecord(imageHash, record);

    console.log('💾 Created local blockchain record:', record.transactionHash);

    return record;
  }

  verifyLocalBlockchainRecord(imageHash) {
    const records = this.getLocalRecords();
    const record = records[imageHash];

    if (record) {
      return {
        exists: true,
        timestamp: record.timestamp,
        trustScore: 75, // Default for local records
        deviceId: 'local-device',
        submitter: 'local-fallback',
        network: 'local-fallback',
        verified: true,
        localFallback: true,
      };
    }

    return {
      exists: false,
      verified: false,
      localFallback: true,
    };
  }

  getLocalBlockchainStats() {
    const records = this.getLocalRecords();

    return {
      totalHashes: Object.keys(records).length.toString(),
      network: 'local-fallback',
      chainId: '0',
      latestBlock: Date.now().toString(),
      connected: false,
      contractAddress: 'local-storage',
      localFallback: true,
    };
  }

  storeLocalRecord(imageHash, record) {
    try {
      const records = this.getLocalRecords();
      records[imageHash] = record;
      localStorage.setItem(
        'verilens_blockchain_records',
        JSON.stringify(records)
      );
    } catch (error) {
      console.error('Failed to store local record:', error);
    }
  }

  getLocalRecords() {
    try {
      const stored = localStorage.getItem('verilens_blockchain_records');
      return stored ? JSON.parse(stored) : {};
    } catch (error) {
      console.error('Failed to get local records:', error);
      return {};
    }
  }

  generateMockTxHash() {
    return Array.from({ length: 64 }, () =>
      Math.floor(Math.random() * 16).toString(16)
    ).join('');
  }

  // Blockchain monitoring
  async monitorTransaction(txHash) {
    if (!this.provider || txHash.startsWith('local_')) {
      return { status: 'confirmed', local: true };
    }

    try {
      let receipt = null;
      let attempts = 0;
      const maxAttempts = 30; // 5 minutes with 10s intervals

      while (!receipt && attempts < maxAttempts) {
        receipt = await this.provider.getTransactionReceipt(txHash);

        if (!receipt) {
          await new Promise((resolve) => setTimeout(resolve, 10000)); // Wait 10 seconds
          attempts++;
        }
      }

      if (receipt) {
        return {
          status: receipt.status === 1 ? 'confirmed' : 'failed',
          blockNumber: receipt.blockNumber,
          gasUsed: receipt.gasUsed.toString(),
          confirmations:
            (await this.provider.getBlockNumber()) - receipt.blockNumber,
        };
      } else {
        return {
          status: 'pending',
          message: 'Transaction not confirmed within timeout',
        };
      }
    } catch (error) {
      console.error('Error monitoring transaction:', error);
      return {
        status: 'error',
        error: error.message,
      };
    }
  }

  // Event listening
  async listenForEvents(callback) {
    if (!this.contract) {
      console.warn('Cannot listen for events without contract connection');
      return;
    }

    try {
      this.contract.on(
        'ImageHashSubmitted',
        (imageHash, timestamp, trustScore, deviceId, submitter, event) => {
          console.log('📡 Blockchain event received:', {
            imageHash: imageHash.substring(0, 16) + '...',
            timestamp: new Date(Number(timestamp) * 1000).toISOString(),
            trustScore: Number(trustScore),
            deviceId,
            submitter,
          });

          if (callback) {
            callback({
              type: 'ImageHashSubmitted',
              data: { imageHash, timestamp, trustScore, deviceId, submitter },
              event,
            });
          }
        }
      );

      console.log('👂 Listening for blockchain events...');
    } catch (error) {
      console.error('Failed to set up event listeners:', error);
    }
  }

  // Utility methods
  isConnected() {
    return this.connected;
  }

  getNetwork() {
    return this.network;
  }

  getContractAddress() {
    return this.contractAddress;
  }

  async getBalance() {
    if (!this.signer) return '0';

    try {
      const balance = await this.signer.getBalance();
      return ethers.formatEther(balance);
    } catch (error) {
      return '0';
    }
  }

  async estimateGasCost(imageHash, trustScore = 50, deviceId = 'test') {
    if (!this.contract) return { gasLimit: '0', gasCost: '0' };

    try {
      const gasLimit = await this.contract.submitImageHash.estimateGas(
        imageHash,
        Math.floor(Date.now() / 1000),
        trustScore,
        deviceId
      );

      const gasPrice = await this.provider.getGasPrice();
      const gasCost = gasLimit * gasPrice;

      return {
        gasLimit: gasLimit.toString(),
        gasPrice: ethers.formatUnits(gasPrice, 'gwei'),
        gasCost: ethers.formatEther(gasCost),
        gasCostUSD:
          '~$' + (parseFloat(ethers.formatEther(gasCost)) * 2000).toFixed(4), // Rough MATIC price
      };
    } catch (error) {
      return { gasLimit: '0', gasCost: '0', error: error.message };
    }
  }
}

// Export for global access
window.BlockchainService = BlockchainService;
