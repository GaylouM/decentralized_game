App = {
  web3Provider: null,
  contracts: {},

  init: function() {


    return App.initWeb3();
  },

  initWeb3: function() {
    // Is there an injected web3 instance?
    if (typeof web3 !== 'undefined') {
      App.web3Provider = web3.currentProvider;
    } else {
      // If no injected web3 instance is detected, fall back to Ganache
      App.web3Provider = new Web3.providers.HttpProvider('http://127.0.0.1:8545');
      // avant c'était http://localhost:8545
    }
    web3 = new Web3(App.web3Provider);

    return App.initContract();
  },

  initContract: function() {
    $.getJSON('ERC721SpaceShip.json', function(data) {
      // Get the necessary contract artifact file and instantiate it with truffle-contract
      var Artifact = data;
      App.contracts.SpaceShip = TruffleContract(Artifact);

      // Set the provider for our contract
      App.contracts.SpaceShip.setProvider(App.web3Provider);

      // Use our contract to retrieve and mark the adopted pets
      return App.updateSpaceShip();
    });

    return App.bindEvents();
  },

  bindEvents: function() {
    $(document).on('click', '.btn-adopt', App.handleAdopt);
  },

  listSpaceShips: function (spaceshipInstance, spaceshipNumber){
    //planets = [];
    console.log("getSpaceShips...");
    var count = spaceshipNumber;
    console.log("getSpaceShips =" + count);
    var spaceshipRow = $('#spaceshipsRow');
    var spaceshipTemplate = $('#spaceshipTemplate');
    for (let spaceshipID = 0; spaceshipID < count; spaceshipID++) {
      //var planetID = planetInstance.planetsList[i];
      //planets.push(planetID);
      console.log("spaceshipInstance.getSpaceShip(spaceshipID):");
      spaceshipInstance.getSpaceShip(spaceshipID).then(function(spaceship) {
        //console.log(planet);
        //console.log(planetID + " - " + web3.toAscii(planet[0]) + " - "  + planet[1] + " - "  + planet[3] + " - "  + planet[4]);
        spaceshipTemplate.find('.panel-title').text(web3.toAscii(spaceship[0]));
        spaceshipTemplate.find('.spaceship-type').text(spaceship[1]);
        //planetTemplate.find('img').attr('src', data[i].picture);
        spaceshipRow.append(spaceshipTemplate.html());
      }).catch(function(err) {
        console.log('ERROR - listSpaceships : ' + err.message);
      });
    }
  },

  updateSpaceShip: function(spaceships, account) {
    var spaceshipInstance;

    App.contracts.SpaceShip.deployed().then(function(instance) {
      spaceshipInstance = instance;

      return spaceshipInstance.getSpaceShipCount();
    }).then(function(spaceships) {
      var msg = spaceships + " ";
      App.listSpaceShips(spaceshipInstance, spaceships);
      console.log("msg="+msg);
      $('#spaceships-count').html(msg);
      //j'ai uncomment ça car c'est indiqué dans le guide pour petshop
      // for (i = 0; i < spaceships; i++) {
      //   if (spaceships[i] !== '0x0000000000000000000000000000000000000000') {
      //     $('.panel-spaceship').eq(i).find('button').text('Success').attr('disabled', true);
      //   }
      // }
      // j'ai uncomment ça car c'est indiqué dans le guide pour petshop
      //'0x0000000000000000000000000000000000000000'
    }).catch(function(err) {
      console.log(err.message);
    });
  },

  handleBuy: function(event) {
    event.preventDefault();
    var spaceshipId = parseInt($(event.target).data('id'));
    var spaceshipInstance;

    web3.eth.getAccounts(function(error, accounts) {
      if (error) {
        console.log(error);
      }

      var account = accounts[0];

      App.contracts.SpaceShip.deployed().then(function(instance) {
        spaceshipInstance = instance;

        // Execute adopt as a transaction by sending account
        return spaceshipInstance.buySpaceShip(spaceshipId, {from: account});
      }).then(function(result) {
        return App.updateSpaceShip();
      }).catch(function(err) {
        console.log(err.message);
      });
    });
  }

};

$(function() {
  $(window).load(function() {
    App.init();
  });
});
