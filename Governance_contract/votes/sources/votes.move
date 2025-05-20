module votes::votes;

use std::option::{Self, borrow_mut};
use std::vector;
use sui::borrow;
use sui::object::{Self, UID};
use sui::transfer;
use sui::tx_context::{TxContext, sender};

//––– Error codes –––
const E_NotCitizen: u64 = 1;

/// Holds all registered voter addresses
public struct Citizen has key, store {
    id: UID,
    citizens: vector<address>,
    voted: vector<address>,
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
    let citizen = Citizen {
        id: object::new(ctx),
        citizens: vector::empty<address>(),
        voted: vector::empty<address>(),
    };
    let reg = PartyRegistry {
        id: object::new(ctx),
        parties: vector::empty<address>(),
    };
    transfer::share_object(citizen);
    transfer::share_object(reg);
}

/// Add a new citizen (anyone can call)
public entry fun add_citizen(citizen_obj: &mut Citizen, new_citizen: address, ctx: &mut TxContext) {
    let len = vector::length(&citizen_obj.citizens);
    let mut i = 0;
    while (i < len) {
        if (*vector::borrow(&citizen_obj.citizens, i) == new_citizen) {
            return;
        };
        i = i + 1;
    };
    vector::push_back(&mut citizen_obj.citizens, new_citizen);
}

/// Remove a citizen (anyone can call)
public entry fun remove_citizen(citizen_obj: &mut Citizen, target: address, ctx: &mut TxContext) {
    let len = vector::length(&citizen_obj.citizens);
    let mut i = 0;
    let mut found = false;
    while (i < len) {
        if (*vector::borrow(&citizen_obj.citizens, i) == target) {
            found = true;
            break;
        };
        i = i + 1;
    };
    assert!(found, E_NotCitizen);
    let last_index = len - 1;
    if (i != last_index) {
        let last = *vector::borrow(&citizen_obj.citizens, last_index);
        *vector::borrow_mut(&mut citizen_obj.citizens, i) = last;
    };
    vector::pop_back(&mut citizen_obj.citizens);
}

/// Only registered citizens may vote (once across all parties)
public entry fun cast_your_vote(citizen_obj: &mut Citizen, party: &mut Party, ctx: &mut TxContext) {
    let caller = sender(ctx);
    let len = vector::length(&citizen_obj.citizens);
    let mut i = 0;
    let mut found = false;
    while (i < len) {
        if (*vector::borrow(&citizen_obj.citizens, i) == caller) {
            found = true;
            break;
        };
        i = i + 1;
    };
    assert!(found, E_NotCitizen);
    let vlen = vector::length(&citizen_obj.voted);
    let mut j = 0;
    while (j < vlen) {
        if (*vector::borrow(&citizen_obj.voted, j) == caller) {
            return;
        };
        j = j + 1;
    };
    party.vote = party.vote + 1;
    vector::push_back(&mut citizen_obj.voted, caller);
}

/// Anyone may create new parties
public entry fun create_party(reg_obj: &mut PartyRegistry, ctx: &mut TxContext) {
    let party = Party {
        id: object::new(ctx),
        vote: 0,
    };
    let party_addr = object::id_address(&party);
    transfer::share_object(party);
    vector::push_back(&mut reg_obj.parties, party_addr);
}

/// Anyone may delete a party
public entry fun delete_party(party: Party, ctx: &mut TxContext) {
    let Party { id, .. } = party;
    object::delete(id);
}

/// Read-only: returns the vote count for one party
public entry fun get_party_votes(p: &Party, ctx: &mut TxContext): u64 {
    p.vote
}

public entry fun reset_vote(party_ref: &mut Party, citizens: &mut Citizen, ctx: &mut TxContext) {
    party_ref.vote = 0;
    citizens.voted = vector::empty<address>();
}
