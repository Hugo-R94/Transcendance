import type { Conversation, Friend, FriendRequest } from "../api/chat";

export function getOtherUser(conv: Conversation) {
    const myUserId = localStorage.getItem("userID");

    if (!myUserId) return null;

    if (String(conv.user1_id) === String(myUserId)) {
        return conv.user2;
    }

    if (String(conv.user2_id) === String(myUserId)) {
        return conv.user1;
    }

    return null;
}

export function getAcceptance(conv: Conversation) {
    const myUserId = localStorage.getItem("userID");

    if (String(conv.user1_id) === String(myUserId)) {
        return {
            myAccepted: conv.accepted_1,
            otherAccepted: conv.accepted_2,
        };
    }

    return {
        myAccepted: conv.accepted_2,
        otherAccepted: conv.accepted_1,
    };
}

export function deriveFriendsAndRequests(convs: Conversation[]) {
    const friends: Friend[] = convs
        .filter((conv) => {
            const { myAccepted, otherAccepted } = getAcceptance(conv);

            return myAccepted === true && otherAccepted === true;
        })
        .map((conv) => {
            const user = getOtherUser(conv);

            if (!user) return null;

            return {
                id: user.id,
                username: user.username,
                profilePic: user.profile_pic,
            };
        })
        .filter((f): f is Friend => f !== null);

    const requests: FriendRequest[] = convs
        .filter((conv) => {
            const { myAccepted, otherAccepted } = getAcceptance(conv);

            return myAccepted === false && otherAccepted === true;
        })
        .map((conv) => {
            const user = getOtherUser(conv);

            if (!user) return null;

            return {
                id: user.id,
                username: user.username,
                profilePic: user.profile_pic,
            };
        })
        .filter((r): r is FriendRequest => r !== null);

    return { friends, requests };
}