import Map "mo:core/Map";
import List "mo:core/List";
import Principal "mo:core/Principal";
import Text "mo:core/Text";
import Time "mo:core/Time";

module {
  type Account = {
    principalId : Principal;
    cashBalance : Float;
    icpBalance : Float;
    totalPortfolioValue : Float;
    pnl : Float;
    lastUpdated : Time.Time;
  };

  type GameModeData = {
    accounts : Map.Map<Principal, Account>;
    winners : List.List<{
      winner : Principal;
      finalPortfolioValue : Float;
      profitLoss : Float;
      timestamp : Time.Time;
    }>;
    leveragedPositions : Map.Map<Principal, List.List<{
      positionType : { #long; #short };
      leverage : Float;
      entryPrice : Float;
      amountICP : Float;
      margin : Float;
      openedAt : Time.Time;
      isOpen : Bool;
      liquidationPrice : Float;
    }>>;
    openPositions : Map.Map<Principal, List.List<{
      positionType : { #long; #short };
      leverage : Float;
      entryPrice : Float;
      amountICP : Float;
      margin : Float;
      openedAt : Time.Time;
      isOpen : Bool;
      liquidationPrice : Float;
    }>>;
    transactionLedger : Map.Map<Principal, List.List<{
      timestamp : Time.Time;
      transactionType : { #buy; #sell };
      icpAmount : Float;
      price : Float;
      cashBalanceAfter : Float;
      icpBalanceAfter : Float;
    }>>;
  };

  public func run(old : { userProfiles : Map.Map<Principal, { name : Text }>; gameModes : Map.Map<Text, GameModeData> }) : { userProfiles : Map.Map<Principal, { name : Text }>; gameModes : Map.Map<Text, GameModeData> } {
    old;
  };
};
