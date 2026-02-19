import Array "mo:core/Array";
import Blob "mo:core/Blob";
import Float "mo:core/Float";
import Map "mo:core/Map";
import List "mo:core/List";
import OutCall "http-outcalls/outcall";
import Order "mo:core/Order";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import Time "mo:core/Time";
import Iter "mo:core/Iter";
import AccessControl "authorization/access-control";
import MixinAuthorization "authorization/MixinAuthorization";
import Text "mo:core/Text";



actor {
  public type GameMode = {
    #daily;
    #weekly;
    #monthly;
    #yearly;
  };

  module GameMode {
    public func toText(gameMode : GameMode) : Text {
      switch (gameMode) {
        case (#daily) { "daily" };
        case (#weekly) { "weekly" };
        case (#monthly) { "monthly" };
        case (#yearly) { "yearly" };
      };
    };

    public func fromText(text : Text) : GameMode {
      switch (text) {
        case ("daily") { #daily };
        case ("weekly") { #weekly };
        case ("monthly") { #monthly };
        case ("yearly") { #yearly };
        case (_) { #daily };
      };
    };
  };

  public type Winner = {
    winner : Principal;
    finalPortfolioValue : Float;
    profitLoss : Float;
    timestamp : Time.Time;
  };

  public type Account = {
    cashBalance : Float;
    icpBalance : Float;
    pnl : Float;
    lastUpdated : Time.Time;
  };

  module Account {
    public func compare(a : Account, b : Account) : Order.Order {
      Float.compare(b.pnl, a.pnl);
    };
  };

  public type UserProfile = {
    name : Text;
  };

  let accounts = Map.empty<Text, Map.Map<Principal, Account>>();
  let userProfiles = Map.empty<Principal, UserProfile>();
  let accessControlState = AccessControl.initState();
  let gameModeWinners = Map.empty<Text, List.List<Winner>>();
  include MixinAuthorization(accessControlState);

  public query func transform(input : OutCall.TransformationInput) : async OutCall.TransformationOutput {
    OutCall.transform(input);
  };

  public shared ({ caller }) func getICPPrice() : async Float {
    let url = "https://api.coingecko.com/api/v3/simple/price?ids=internet-computer&vs_currencies=usd";
    let _ = await OutCall.httpGetRequest(url, [], transform);
    0.0;
  };

  public shared ({ caller }) func createAccount(gameMode : GameMode) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create accounts");
    };
    let gameModeKey = GameMode.toText(gameMode);
    let modeAccounts = switch (accounts.get(gameModeKey)) {
      case (null) { Map.empty<Principal, Account>() };
      case (?acc) { acc };
    };
    if (modeAccounts.containsKey(caller)) {
      Runtime.trap("Account already exists");
    };
    let newAccount : Account = {
      cashBalance = 10_000.0;
      icpBalance = 0.0;
      pnl = 0.0;
      lastUpdated = Time.now();
    };
    modeAccounts.add(caller, newAccount);
    accounts.add(gameModeKey, modeAccounts);
  };

  public query ({ caller }) func getAccount(gameMode : GameMode, user : Principal) : async ?Account {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own account");
    };
    let gameModeKey = GameMode.toText(gameMode);
    let modeAccounts = switch (accounts.get(gameModeKey)) {
      case (null) { Map.empty<Principal, Account>() };
      case (?acc) { acc };
    };
    modeAccounts.get(user);
  };

  public shared ({ caller }) func buyICP(gameMode : GameMode, amount : Float, price : Float) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can buy ICP");
    };
    let gameModeKey = GameMode.toText(gameMode);
    let modeAccounts = switch (accounts.get(gameModeKey)) {
      case (null) { Map.empty<Principal, Account>() };
      case (?acc) { acc };
    };
    let account = switch (modeAccounts.get(caller)) {
      case (null) { Runtime.trap("Account not found") };
      case (?acc) { acc };
    };
    let cost = amount * price;
    if (cost > account.cashBalance) { Runtime.trap("Insufficient funds") };

    let updatedAccount : Account = {
      cashBalance = account.cashBalance - cost;
      icpBalance = account.icpBalance + amount;
      pnl = account.pnl;
      lastUpdated = Time.now();
    };
    modeAccounts.add(caller, updatedAccount);
    accounts.add(gameModeKey, modeAccounts);
  };

  public shared ({ caller }) func sellICP(gameMode : GameMode, amount : Float, price : Float) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can sell ICP");
    };
    let gameModeKey = GameMode.toText(gameMode);
    let modeAccounts = switch (accounts.get(gameModeKey)) {
      case (null) { Map.empty<Principal, Account>() };
      case (?acc) { acc };
    };
    let account = switch (modeAccounts.get(caller)) {
      case (null) { Runtime.trap("Account not found") };
      case (?acc) { acc };
    };
    if (amount > account.icpBalance) { Runtime.trap("Insufficient ICP balance") };
    let proceeds = amount * price;
    let updatedAccount : Account = {
      cashBalance = account.cashBalance + proceeds;
      icpBalance = account.icpBalance - amount;
      pnl = account.pnl;
      lastUpdated = Time.now();
    };
    modeAccounts.add(caller, updatedAccount);
    accounts.add(gameModeKey, modeAccounts);
  };

  public query ({ caller }) func getLeaderboard(gameMode : GameMode) : async [(Principal, Account)] {
    let modeAccounts = switch (accounts.get(GameMode.toText(gameMode))) {
      case (null) { Map.empty<Principal, Account>() };
      case (?acc) { acc };
    };
    let entries = modeAccounts.toArray();
    entries.sort(
      func(a, b) {
        Account.compare(a.1, b.1);
      }
    );
  };

  public shared ({ caller }) func resetAccount(gameMode : GameMode) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can reset accounts");
    };
    let modeAccounts = switch (accounts.get(GameMode.toText(gameMode))) {
      case (null) { Map.empty<Principal, Account>() };
      case (?acc) { acc };
    };
    let updatedAccount : Account = {
      cashBalance = 10_000.0;
      icpBalance = 0.0;
      pnl = 0.0;
      lastUpdated = Time.now();
    };
    modeAccounts.add(caller, updatedAccount);
  };

  public shared ({ caller }) func markWinner(gameMode : GameMode, winner : Winner) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can mark winners");
    };
    let gameModeKey = GameMode.toText(gameMode);
    let winnersList = switch (gameModeWinners.get(gameModeKey)) {
      case (null) { List.empty<Winner>() };
      case (?winners) { winners };
    };
    winnersList.add(winner);
    gameModeWinners.add(gameModeKey, winnersList);
  };

  public query ({ caller }) func getWinners(gameMode : GameMode) : async [Winner] {
    switch (gameModeWinners.get(GameMode.toText(gameMode))) {
      case (null) { [] };
      case (?winners) { winners.toArray() };
    };
  };

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access profiles");
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
};
