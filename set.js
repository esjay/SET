define(["jquery", "lodash", walrus], function($, _, Walrus) {
  console.clear();
  var $list = $("#gameBoard"),
      $activeSelection = $("#selectedCards"),
      setLimit = 3,
      proposedSet = [],
      card = {
        init: function(properties) {
          _(this).bindAll();
          this.propKeys = _.keys(properties);
        },
        getClass: function() {
          return _.values(this).join(' ');
        }
      },
      gameProto = {
        boardSize: 12,
        init: function() {
          _(this).bindAll();
          this.generateAllCards();
        },
        allCombos: [],
        cardProto: card,
        cards: [],
        foundSets: [],
        validSets: [],
        selected: [],
        getSelected: function() {
          return _.at(this.cards, this.selected);
        },
        toggleSelect: function(cardId) {
          this.selected = _.xor(this.selected, [cardId]);
          return this.selected;
        },
        registerFoundSet: function(selectedCards) {
          if(_.where(this.foundSets, selectedCards).length > 0) {
            console.log("Old set");
          } else {
            console.log("Found a new set");
            this.foundSets.push(_.sortBy(selectedCards, function(num) {
              return _.parseInt(num);
            }));          
          }
        },
        getRemainingSets: function() {

          return _.difference(this.validSets, this.foundSets);
  /*        return _.reject(this.validSets, function(set) {
            return _.every(set, function(card) {
              return _.contains(selectedCards, card);
            });
          })
  */      },
        checkSelection: function() {
          var results = this.checkSet(this.selected);
          results = this.interpretResults(results);
          if(results.victory) {
            this.registerFoundSet(this.selected);
          }
          return this.craftMarkup(results);
        },
        checkSet: function(setArray) {
          var propKeys = this.getPropKeys(),
              results = {},
              cards = _.at(this.cards, setArray);
          
          _(propKeys).each(function(prop) {
            results[prop] = _.unique(cards, prop).length;
          });
          
          return results;
        },
        interpretResults: function(results) {
          var viewData = {},
              propertiesPassing = 0;
          
          viewData.properties = _.toArray(_.mapValues(results, function(val, key) {
            var result = {
              name: key
            };
            if(val === 1) {
              propertiesPassing++;
              result.match = "all";
            } else if(val === setLimit) {
              propertiesPassing++;
              result.match = "none";
            } else {
              result.match = "partial";
            }
            return result;
          }));
          
          viewData.selectedCards = this.getSelected();
          viewData.victory = (propertiesPassing === this.getPropKeys().length);
          viewData.setLimit = setLimit;
          return viewData;
        },
        craftMarkup: function(viewData) {
          var template = Walrus.Parser.parse( $(".results-template").html()),
              htmlGoodness = template.compile(viewData);
          
          return htmlGoodness;
        },
        cardProperties: {
          color: ["red", "purple", "green"],
          shape: ["diamond", "squiggle", "oval"],
          count: ["one", "two", "three"],
          shading : ["solid", "stroke", "striped"]
        },
        getPropKeys: function() {
          return _.keys(this.cardProperties);
        },
        generateAllCards: function() {
          this.allCombos = cartesianProductOf.apply(this, _.toArray(this.cardProperties));
        },
        generateGame: function() {
          var playingCards,
              validSets,
              propKeys = this.getPropKeys(),
              sanity = 5;
          
          this.selected = [];
          this.foundSets = [];
          this.validSets = [];

          do {
            playingCards = _.sample(this.allCombos, this.boardSize);

            this.cards = [];
          
            _(playingCards).each(function(combo) {
              this.cards.push(_.create(
                this.cardProto,
                _.zipObject(propKeys, combo),
                {propKeys: propKeys}
              ));
            }, this);
          
            validSets = this.getValidSets();
            if(validSets.length < 1) {
              console.log("Hey, a game with no valid sets!", _.clone(this.cards));
            }
          } while(validSets.length < 1 && sanity-- > 1);

          $(".sets-remaining").html("Sets to Find: " + validSets.length);
          
          $list.empty();
          _(newGame.cards).each(function(card, index) {
            $list.append($("<li>").data("card", index).attr("class", card.getClass()));
            $list.addClass("activated");
          });

        },
        getValidSets: function() {
          this.validSets = _.filter(allSets(_.range(this.cards.length)), function(cardSet) {
            return _.every( _.toArray(_.mapValues(this.checkSet(cardSet), function(val, key) {
              return (val === 1 || val === setLimit);
            })));
          }, this);
          return this.validSets;
        }
      },
      newGame = gameProto,
      $result = $(".result-message");

    return {
      init: function() {
        window.game = newGame;
        newGame.init();
        newGame.generateGame();

        _(_.range(setLimit)).each(function(index) {
          $activeSelection.append($("<li>").addClass("placeholder").text("?"));
        });


      }
    };

  $(".new-game").click(function(event) {
    event.preventDefault();
    closeResults();
    newGame.generateGame();
    $(".check-selection").prop("disabled", true)
  });

  $(".check-selection").click(function(event) {
    event.preventDefault();
    
    showResults();
    $(".sets-remaining").text("Sets to Find: " + (game.validSets.length - game.foundSets.length));

  });


  $list.on("click", "li", function(event) {
    var $card = $(this),
        id = $card.data("card");
    event.preventDefault();
    
    newGame.toggleSelect(id);

    updateSelectedCards();
    
    closeResults();
  });

  $("body").on("click", "#results-ok", function(event) {
    event.preventDefault();
    closeResults();
  });

  $(".description-show").on("click", function(event) {
    event.preventDefault();
    $(".description").toggle();
  });
  $(".description").hide();

  function updateSelectedCards() {
    var selectedIndices = newGame.selected,
        selectedCards = newGame.getSelected();
    
    $("li", $list).each(function(i) {
      $(this).toggleClass("selected", _.contains(selectedIndices, $(this).data("card")));
    });
    $(".check-selection").prop("disabled", selectedIndices.length !== setLimit);
    
    $("li", $activeSelection).each(function(i) {
      if(_.has(selectedCards, i)) {
        $(this)
          .attr("class", selectedCards[i].getClass());
      } else {
        $(this).attr("class", "placeholder");
      }
    });

  }

  function closeResults() {
    $result.empty().fadeTo(250, 0).delay(250).hide();
  }

  function showResults() {
    $result.html(newGame.checkSelection()).fadeTo(250, 1);
  //  newGame.selected = [];
  //  updateSelectedCards();
  }

  function cartesianProductOf() {
    // From https://gist.github.com/ijy/6094414
    return _.reduce(arguments, function(a, b) {
        return _.flatten(_.map(a, function(x) {
            return _.map(b, function(y) {
                return x.concat([y]);
            });
        }), true);
    }, [ [] ]);
  }
  function powerset(arr) {
      var ps = [[]];
      for (var i=0; i < arr.length; i++) {
          for (var j = 0, len = ps.length; j < len; j++) {
              ps.push(ps[j].concat(arr[i]));
          }
      }
      return ps;
  }
  function allSets(arr) {
    return _.reject(_.uniq(powerset(arr)), function(a) {return a.length !== setLimit });
  }
});