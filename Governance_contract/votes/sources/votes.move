module votes::votes;

use std::vector;
use sui::object;
use sui::transfer;
use sui::tx_context::{TxContext, sender};

//––– Error codes –––
const E_NotOwner: u64 = 0;
const E_NotCitizen: u64 = 1;

//––– Admin address –––
const OWNER: address = @0xccf4b0c1f117be1223f224c9713ef2e81b8437cedbbfd95bd2cbfa3a5f977a79;

/// Holds all registered voter addresses
public struct Citizen has key, store {
    id: UID,
    citizens: vector<address>,
}

/// Simple party with vote tally
public struct Party has key, store {
    id: UID,
    vote: u64,
}

public struct PartyRegistry has key, store {
    id: UID,
    parties: vector<address>,
}

fun init(ctx: &mut TxContext) {
    let reg = PartyRegistry {
        id: object::new(ctx),
        parties: vector::empty<address>(),
    };
    let citizen = Citizen {
        id: object::new(ctx),
        citizens: vector::empty<address>(),
    };
    transfer::share_object(citizen);
    transfer::share_object(reg);
}

/// Add a new citizen (only OWNER can call this)
public entry fun add_citizen(citizen_obj: &mut Citizen, new_citizen: address, ctx: &mut TxContext) {
    assert!(sender(ctx) == OWNER, E_NotOwner);

    // Check if the citizen is already registered
    let len = vector::length(&citizen_obj.citizens);
    let mut i = 0;
    while (i < len) {
        if (*vector::borrow(&citizen_obj.citizens, i) == new_citizen) {
            return; // Already exists, do nothing
        };
        i = i + 1;
    };

    // Add new citizen
    vector::push_back(&mut citizen_obj.citizens, new_citizen);
}

/// Remove a citizen (only OWNER can call this)
public entry fun remove_citizen(citizen_obj: &mut Citizen, target: address, ctx: &mut TxContext) {
    assert!(sender(ctx) == OWNER, E_NotOwner);

    let len = vector::length(&citizen_obj.citizens);
    let mut i = 0;
    let mut found = false;

    // Find and remove the target
    while (i < len) {
        if (*vector::borrow(&citizen_obj.citizens, i) == target) {
            found = true;
            break;
        };
        i = i + 1;
    };

    assert!(found, E_NotCitizen); // Error if target not found

    // Remove by swapping with the last element and popping
    let last_index = len - 1;
    if (i != last_index) {
        let last = *vector::borrow(&citizen_obj.citizens, last_index);
        *vector::borrow_mut(&mut citizen_obj.citizens, i) = last;
    };
    vector::pop_back(&mut citizen_obj.citizens);
}

/// Only registered citizens may vote
public entry fun cast_your_vote(citizen_obj: &Citizen, party: &mut Party, ctx: &mut TxContext) {
    let caller = sender(ctx);

    let len = vector::length(&citizen_obj.citizens);
    let mut i = 0;
    let mut found = false;

    while (i < len) {
        // borrow returns &address, so we compare by value
        if (*vector::borrow(&citizen_obj.citizens, i) == caller) {
            found = true;
            break;
        };
        i = i + 1;
    };

    // use your constant, not a magic number
    assert!(found, E_NotCitizen);

    // OK to vote
    party.vote = party.vote + 1;
}

/// Only OWNER may create new parties
public entry fun create_party(reg_obj: &mut PartyRegistry, ctx: &mut TxContext) {
    assert!(sender(ctx) == OWNER, E_NotOwner);

    let party = Party {
        id: object::new(ctx),
        vote: 0,
    };
    let party_addr = object::id_address(&party);
    transfer::share_object(party);

    // 2) Record that address in our registry
    vector::push_back(&mut reg_obj.parties, party_addr);
}

/// Only OWNER may delete parties
public entry fun delete_party(party: Party, ctx: &mut TxContext) {
    assert!(sender(ctx) == OWNER, E_NotOwner);

    let Party { id, .. } = party;
    id.delete();
}
//0x982078a82fc36c65eab169eee0da0e94d281ddf3bfbbde9a6b1a4933c87bd38e party registery
