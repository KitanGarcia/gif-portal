const anchor = require("@project-serum/anchor");

const { SystemProgram } = anchor.web3;

const main = async () => {
  console.log("Starting test...");

  const provider = anchor.AnchorProvider.env();
  const program = anchor.workspace.GifPortal;

  // Create an account keypair for our program to use
  const baseAccount = anchor.web3.Keypair.generate();

  const tx = await program.rpc.startStuffOff({
    accounts: {
      baseAccount: baseAccount.publicKey,
      user: provider.wallet.publicKey,
      systemProgram: SystemProgram.programId,
    },
    signers: [baseAccount],
  });

  console.log("Your transaction signature", tx);

  let account = await program.account.baseAccount.fetch(baseAccount.publicKey);
  console.log("Gif count: ", account.totalGifs.toString());

  // Call add_gif
  await program.rpc.addGif({
    accounts: {
      baseAccount: baseAccount.publicKey,
    },
  });

  account = await program.account.baseAccount.fetch(baseAccount.publicKey);
  console.log("Gif count: ", account.totalGifs.toString());
};

const runMain = async () => {
  try {
    await main();
    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

runMain();
