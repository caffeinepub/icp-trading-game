import Array "mo:core/Array";
import Float "mo:core/Float";
import Iter "mo:core/Iter";
import List "mo:core/List";
import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import Text "mo:core/Text";
import Time "mo:core/Time";
import OutCall "http-outcalls/outcall";
import AccessControl "authorization/access-control";
import MixinAuthorization "authorization/MixinAuthorization";

actor {
  type TransactionType = { #buy; #sell };
  type UserProfile = { name : Text };

  type LedgerTransaction = {
    timestamp : Time.Time;
    transactionType : TransactionType;
    icpAmount : Float;
    price : Float;
    cashBalanceAfter : Float;
    icpBalanceAfter : Float;
  };

  type Account = {
    principalId : Principal;
    cashBalance : Float;
    icpBalance : Float;
    totalPortfolioValue : Float;
    pnl : Float;
    lastUpdated : Time.Time;
  };

  type LeveragedPosition = {
    positionType : { #long; #short };
    leverage : Float;
    entryPrice : Float;
    amountICP : Float;
    margin : Float;
    openedAt : Time.Time;
    isOpen : Bool;
    liquidationPrice : Float;
  };

  type GameModeData = {
    accounts : Map.Map<Principal, Account>;
    winners : List.List<{
      winner : Principal;
      finalPortfolioValue : Float;
      profitLoss : Float;
      timestamp : Time.Time;
    }>;
    leveragedPositions : Map.Map<Principal, List.List<LeveragedPosition>>;
    openPositions : Map.Map<Principal, List.List<LeveragedPosition>>;
    transactionLedger : Map.Map<Principal, List.List<LedgerTransaction>>;
  };

  let userProfiles = Map.empty<Principal, UserProfile>();
  let gameModes = Map.empty<Text, GameModeData>();

  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  func hasUserProfile(principal : Principal) : Bool {
    switch (userProfiles.get(principal)) {
      case (null) { false };
      case (?_) { true };
    };
  };

  public shared ({ caller }) func registerUser(displayName : Text) : async () {
    // Anonymous principals (guests) cannot register
    if (caller.isAnonymous()) {
      Runtime.trap("Unauthorized: Anonymous users cannot register");
    };

    // Check if user is already registered
    if (hasUserProfile(caller)) {
      Runtime.trap("User already exists.");
    };

    let defaultCashBalance : Float = 10_000.0;

    let newAccount = {
      principalId = caller;
      cashBalance = defaultCashBalance;
      icpBalance = 0.0;
      totalPortfolioValue = defaultCashBalance;
      pnl = 0.0;
      lastUpdated = Time.now();
    };

    let userProfile = {
      name = displayName;
    };

    let gameModeData = getOrCreateDefaultGameMode();
    gameModeData.accounts.add(caller, newAccount);

    userProfiles.add(caller, userProfile);

    // Assign user role to the newly registered user
    AccessControl.assignRole(accessControlState, caller, caller, #user);
  };

  public shared ({ caller }) func initializeDefaultGameMode() : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can initialize game modes");
    };

    let defaultGameMode = initDefaultGameModeData();
    gameModes.add("default", defaultGameMode);
  };

  func initDefaultGameModeData() : GameModeData {
    let initialCashBalance : Float = 10_000.0;
    let adminPrincipal = Principal.fromText("2vxsx-fae");
    let adminAccount = {
      principalId = adminPrincipal;
      cashBalance = initialCashBalance;
      icpBalance = 0.0;
      totalPortfolioValue = initialCashBalance;
      pnl = 0.0;
      lastUpdated = Time.now();
    };

    let adminMap = Map.fromIter<Principal, Account>([(adminPrincipal, adminAccount)].values());

    {
      accounts = adminMap;
      winners = List.empty();
      leveragedPositions = Map.empty<Principal, List.List<LeveragedPosition>>();
      openPositions = Map.empty<Principal, List.List<LeveragedPosition>>();
      transactionLedger = Map.empty<Principal, List.List<LedgerTransaction>>();
    };
  };

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  public shared ({ caller }) func getOrCreateAccount() : async Account {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access accounts");
    };

    let defaultGameModeData = getOrCreateDefaultGameMode();
    let existingAccount = defaultGameModeData.accounts.get(caller);

    switch (existingAccount) {
      case (?account) { account };
      case (null) {
        let newAccount = {
          principalId = caller;
          cashBalance = 10_000.0;
          icpBalance = 0.0;
          totalPortfolioValue = 10_000.0;
          pnl = 0.0;
          lastUpdated = Time.now();
        };

        defaultGameModeData.accounts.add(caller, newAccount);
        newAccount;
      };
    };
  };

  public query func transform(input : OutCall.TransformationInput) : async OutCall.TransformationOutput {
    OutCall.transform(input);
  };

  public shared ({ caller }) func getICPPrice() : async Float {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can fetch ICP price");
    };

    let url = "https://api.kongswap.exchange/api/price/icp";
    let _responseBlob = await OutCall.httpGetRequest(url, [], transform);
    0.0;
  };

  public shared ({ caller }) func getBalance() : async (Text, Float, Float) {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view balances");
    };

    let account = await getOrCreateAccount();
    ("default", account.cashBalance, account.icpBalance);
  };

  public shared ({ caller }) func buyICP(amount : Float) : async () {
    // Authenticate the user with role-based access control
    // This check ensures the user is registered (has #user role assigned during registration)
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only registered users can buy ICP");
    };

    // Simulated price check (replace with real implementation)
    var icpPrice : Float = 100.0;

    // Fetch or create account balance (should always exist for registered users)
    let account = await getOrCreateAccount();

    if (account.cashBalance < amount) {
      Runtime.trap("Insufficient cash balance for purchase");
    };

    let remainingCash = account.cashBalance - amount;
    let gainedIcp = amount / icpPrice;

    let updatedAccount = {
      account with 
      cashBalance = remainingCash;
      icpBalance = account.icpBalance + gainedIcp;
      totalPortfolioValue = remainingCash + (account.icpBalance + gainedIcp) * icpPrice;
    };

    let transaction : LedgerTransaction = {
      timestamp = Time.now();
      transactionType = #buy;
      icpAmount = amount;
      price = icpPrice;
      cashBalanceAfter = remainingCash;
      icpBalanceAfter = updatedAccount.icpBalance;
    };

    let defaultGameModeData = getOrCreateDefaultGameMode();

    let transactionsList = switch (defaultGameModeData.transactionLedger.get(caller)) {
      case (null) { List.empty<LedgerTransaction>() };
      case (?transactions) { transactions };
    };

    transactionsList.add(transaction);
    defaultGameModeData.transactionLedger.add(caller, transactionsList);
    defaultGameModeData.accounts.add(caller, updatedAccount);
  };

  public shared ({ caller }) func sellICP(amount : Float) : async () {
    // Authenticate the user with role-based access control
    // This check ensures the user is registered (has #user role assigned during registration)
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only registered users can sell ICP");
    };

    var icpPrice : Float = 100.0;
    let account = await getOrCreateAccount();

    if (account.icpBalance < amount) {
      Runtime.trap("Insufficient ICP balance for sale");
    };

    let updatedAccount = {
      account with
      cashBalance = account.cashBalance + amount * icpPrice;
      icpBalance = account.icpBalance - amount;
      totalPortfolioValue = account.cashBalance + amount * icpPrice + (account.icpBalance - amount) * icpPrice;
    };

    let transaction : LedgerTransaction = {
      timestamp = Time.now();
      transactionType = #sell;
      icpAmount = amount;
      price = icpPrice;
      cashBalanceAfter = updatedAccount.cashBalance;
      icpBalanceAfter = updatedAccount.icpBalance;
    };

    let defaultGameModeData = getOrCreateDefaultGameMode();

    let transactionsList = switch (defaultGameModeData.transactionLedger.get(caller)) {
      case (null) { List.empty<LedgerTransaction>() };
      case (?transactions) { transactions };
    };

    transactionsList.add(transaction);
    defaultGameModeData.transactionLedger.add(caller, transactionsList);
    defaultGameModeData.accounts.add(caller, updatedAccount);
  };

  public query ({ caller }) func getTransactionHistory() : async [LedgerTransaction] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view transaction history");
    };

    let defaultGameModeData = getOrCreateDefaultGameMode();
    let transactions = switch (defaultGameModeData.transactionLedger.get(caller)) {
      case (null) { return [] };
      case (?transactions) { transactions };
    };
    transactions.values().toArray();
  };

  func getOrCreateDefaultGameMode() : GameModeData {
    switch (gameModes.get("default")) {
      case (null) {
        let defaultGameMode = initDefaultGameModeData();
        gameModes.add("default", defaultGameMode);
        defaultGameMode;
      };
      case (?data) { data };
    };
  };

  public query ({ caller }) func getBalanceForUser(user : Principal) : async (Text, Float, Float) {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can view other users' balances");
    };

    let defaultGameModeData = getOrCreateDefaultGameMode();
    let account = switch (defaultGameModeData.accounts.get(user)) {
      case (null) { Runtime.trap("Account not found") };
      case (?account) { account };
    };
    ("default", account.cashBalance, account.icpBalance);
  };

  public query ({ caller }) func getTransactionHistoryForUser(user : Principal) : async [LedgerTransaction] {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can view other users' transaction history");
    };

    let defaultGameModeData = getOrCreateDefaultGameMode();
    let transactions = switch (defaultGameModeData.transactionLedger.get(user)) {
      case (null) { return [] };
      case (?transactions) { transactions };
    };
    transactions.values().toArray();
  };
};
