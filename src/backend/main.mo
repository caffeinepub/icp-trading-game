import Array "mo:core/Array";
import Float "mo:core/Float";
import Map "mo:core/Map";
import Text "mo:core/Text";
import Time "mo:core/Time";
import Iter "mo:core/Iter";
import Runtime "mo:core/Runtime";
import Order "mo:core/Order";
import Principal "mo:core/Principal";
import List "mo:core/List";

import AccessControl "authorization/access-control";
import OutCall "http-outcalls/outcall";
import MixinAuthorization "authorization/MixinAuthorization";


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
    public func toPrincipal(account : Account, principal : Principal) : (Principal, Account) {
      (principal, account);
    };
    public func compare(a : Account, b : Account) : Order.Order {
      Float.compare(b.pnl, a.pnl);
    };
  };

  public type UserProfile = {
    name : Text;
  };

  public type PositionType = {
    #long;
    #short;
  };

  public type LeveragedPosition = {
    positionType : PositionType;
    leverage : Float;
    entryPrice : Float;
    amountICP : Float;
    margin : Float;
    openedAt : Time.Time;
    isOpen : Bool;
    liquidationPrice : Float;
  };

  public type GameModeState = {
    accounts : Map.Map<Principal, Account>;
    winners : List.List<Winner>;
    leveragedPositions : Map.Map<Principal, List.List<LeveragedPosition>>;
    openPositions : Map.Map<Principal, List.List<LeveragedPosition>>;
  };

  var userProfiles = Map.empty<Principal, UserProfile>();
  var gameModes = Map.empty<Text, GameModeState>();

  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  public query func transform(input : OutCall.TransformationInput) : async OutCall.TransformationOutput {
    OutCall.transform(input);
  };

  public shared func getICPPrice() : async Float {
    let url = "https://api.kongswap.exchange/api/price/icp";
    let _ = await OutCall.httpGetRequest(url, [], transform);
    0.0;
  };

  public shared ({ caller }) func createAccount(gameMode : GameMode) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create accounts");
    };
    let gameModeKey = GameMode.toText(gameMode);
    let currentGameMode = switch (gameModes.get(gameModeKey)) {
      case (null) { Runtime.trap("Game mode not found") };
      case (?mode) { mode };
    };
    if (currentGameMode.accounts.containsKey(caller)) {
      Runtime.trap("Account already exists");
    };
    let newAccount : Account = {
      cashBalance = 10_000.0;
      icpBalance = 0.0;
      pnl = 0.0;
      lastUpdated = Time.now();
    };
    currentGameMode.accounts.add(caller, newAccount);
    gameModes.add(gameModeKey, currentGameMode);
  };

  public query ({ caller }) func getAccount(gameMode : GameMode, user : Principal) : async ?Account {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own account");
    };
    let gameModeKey = GameMode.toText(gameMode);
    let currentGameMode = switch (gameModes.get(gameModeKey)) {
      case (null) { Runtime.trap("Game mode not found") };
      case (?mode) { mode };
    };
    currentGameMode.accounts.get(user);
  };

  public shared ({ caller }) func buyICP(gameMode : GameMode, amount : Float, price : Float) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can buy ICP");
    };
    let gameModeKey = GameMode.toText(gameMode);
    let currentGameMode = switch (gameModes.get(gameModeKey)) {
      case (null) { Runtime.trap("Game mode not found") };
      case (?mode) { mode };
    };
    let account = switch (currentGameMode.accounts.get(caller)) {
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
    currentGameMode.accounts.add(caller, updatedAccount);
    gameModes.add(gameModeKey, currentGameMode);
  };

  public shared ({ caller }) func sellICP(gameMode : GameMode, amount : Float, price : Float) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can sell ICP");
    };
    let gameModeKey = GameMode.toText(gameMode);
    let currentGameMode = switch (gameModes.get(gameModeKey)) {
      case (null) { Runtime.trap("Game mode not found") };
      case (?mode) { mode };
    };
    let account = switch (currentGameMode.accounts.get(caller)) {
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
    currentGameMode.accounts.add(caller, updatedAccount);
    gameModes.add(gameModeKey, currentGameMode);
  };

  public query ({ caller }) func getLeaderboard(gameMode : GameMode) : async [(Principal, Account)] {
    let currentGameMode = switch (gameModes.get(GameMode.toText(gameMode))) {
      case (null) { Runtime.trap("Game mode not found") };
      case (?mode) { mode };
    };
    let entries = currentGameMode.accounts.toArray();
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
    let currentGameMode = switch (gameModes.get(GameMode.toText(gameMode))) {
      case (null) { Runtime.trap("Game mode not found") };
      case (?mode) { mode };
    };
    let updatedAccount : Account = {
      cashBalance = 10_000.0;
      icpBalance = 0.0;
      pnl = 0.0;
      lastUpdated = Time.now();
    };
    currentGameMode.accounts.add(caller, updatedAccount);
  };

  public shared ({ caller }) func markWinner(gameMode : GameMode, winner : Winner) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can mark winners");
    };
    let gameModeKey = GameMode.toText(gameMode);
    let currentGameMode = switch (gameModes.get(gameModeKey)) {
      case (null) { Runtime.trap("Game mode not found") };
      case (?mode) { mode };
    };
    currentGameMode.winners.add(winner);
  };

  public query ({ caller }) func getWinners(gameMode : GameMode) : async [Winner] {
    switch (gameModes.get(GameMode.toText(gameMode))) {
      case (null) { [] };
      case (?mode) { mode.winners.toArray() };
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

  public shared ({ caller }) func openLongPosition(gameMode : GameMode, amountICP : Float, price : Float, leverage : Float) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can open positions");
    };
    validateLeverage(leverage);
    openPosition(caller, gameMode, amountICP, price, leverage, #long);
  };

  public shared ({ caller }) func openShortPosition(gameMode : GameMode, amountICP : Float, price : Float, leverage : Float) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can open positions");
    };
    validateLeverage(leverage);
    openPosition(caller, gameMode, amountICP, price, leverage, #short);
  };

  func openPosition(caller : Principal, gameMode : GameMode, amountICP : Float, price : Float, leverage : Float, positionType : PositionType) {
    let gameModeKey = GameMode.toText(gameMode);
    let currentGameMode = switch (gameModes.get(gameModeKey)) {
      case (null) { Runtime.trap("Game mode not found") };
      case (?mode) { mode };
    };

    let account = switch (currentGameMode.accounts.get(caller)) {
      case (null) { Runtime.trap("Account not found") };
      case (?acc) { acc };
    };

    let positionSize = amountICP * price * leverage;
    let margin = positionSize / leverage;

    if (margin > account.cashBalance) { Runtime.trap("Insufficient funds for margin") };

    let liquidationPrice = calculateLiquidationPrice(positionType, price, leverage);

    let newPosition : LeveragedPosition = {
      positionType;
      leverage;
      entryPrice = price;
      amountICP;
      margin;
      openedAt = Time.now();
      isOpen = true;
      liquidationPrice;
    };

    let userPositions = switch (currentGameMode.leveragedPositions.get(caller)) {
      case (null) {
        List.fromArray<LeveragedPosition>([newPosition]);
      };
      case (?positions) {
        positions.add(newPosition);
        positions;
      };
    };

    currentGameMode.leveragedPositions.add(caller, userPositions);

    let updatedAccount : Account = {
      cashBalance = account.cashBalance - margin;
      icpBalance = account.icpBalance;
      pnl = account.pnl;
      lastUpdated = Time.now();
    };
    currentGameMode.accounts.add(caller, updatedAccount);
    gameModes.add(gameModeKey, currentGameMode);
  };

  func validateLeverage(leverage : Float) {
    switch (leverage) {
      case (3.0) {};
      case (5.0) {};
      case (10.0) {};
      case (20.0) {};
      case (_) { Runtime.trap("Invalid leverage, supported: 3x, 5x, 10x, 20x") };
    };
  };

  func calculateLiquidationPrice(positionType : PositionType, entryPrice : Float, leverage : Float) : Float {
    let marginThreshold = 0.9;
    switch (positionType) {
      case (#long) { entryPrice * (1.0 - marginThreshold / leverage) };
      case (#short) { entryPrice * (1.0 + marginThreshold / leverage) };
    };
  };

  public shared ({ caller }) func closePosition(gameMode : GameMode, positionIndex : Nat, currentPrice : Float) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can close positions");
    };
    let gameModeKey = GameMode.toText(gameMode);
    let currentGameMode = switch (gameModes.get(gameModeKey)) {
      case (null) { Runtime.trap("Game mode not found") };
      case (?mode) { mode };
    };
    let account = switch (currentGameMode.accounts.get(caller)) {
      case (null) { Runtime.trap("Account not found") };
      case (?acc) { acc };
    };

    let userPositions = switch (currentGameMode.leveragedPositions.get(caller)) {
      case (null) { Runtime.trap("No positions found") };
      case (?positions) { positions };
    };

    if (userPositions.size() <= positionIndex) { Runtime.trap("Position not found") };

    let originalPosition = userPositions.at(positionIndex);

    if (not originalPosition.isOpen) {
      Runtime.trap("Position already closed");
    };

    let priceDifference = switch (originalPosition.positionType) {
      case (#long) { currentPrice - originalPosition.entryPrice };
      case (#short) { originalPosition.entryPrice - currentPrice };
    };

    let profitLoss = (priceDifference * originalPosition.amountICP * originalPosition.leverage);

    let updatedPositions = userPositions.map<LeveragedPosition, LeveragedPosition>(
      func(pos) {
        if (pos == originalPosition) {
          { pos with isOpen = false };
        } else { pos };
      }
    );

    currentGameMode.leveragedPositions.add(caller, updatedPositions);

    let updatedAccount : Account = {
      cashBalance = account.cashBalance + originalPosition.margin + profitLoss;
      icpBalance = account.icpBalance;
      pnl = account.pnl + profitLoss;
      lastUpdated = Time.now();
    };
    currentGameMode.accounts.add(caller, updatedAccount);
    gameModes.add(gameModeKey, currentGameMode);
  };

  public query ({ caller }) func getOpenPositions(gameMode : GameMode) : async [LeveragedPosition] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view positions");
    };
    let gameModeKey = GameMode.toText(gameMode);
    let currentGameMode = switch (gameModes.get(gameModeKey)) {
      case (null) { Runtime.trap("Game mode not found") };
      case (?mode) { mode };
    };

    var allPositions = List.empty<LeveragedPosition>();

    switch (currentGameMode.leveragedPositions.get(caller)) {
      case (null) {};
      case (?positions) {
        for (pos in positions.toArray().values()) {
          if (pos.isOpen) { allPositions.add(pos) };
        };
      };
    };

    switch (currentGameMode.openPositions.get(caller)) {
      case (null) {};
      case (?positions) {
        for (pos in positions.toArray().values()) {
          if (pos.isOpen) { allPositions.add(pos) };
        };
      };
    };

    allPositions.toArray();
  };
};
