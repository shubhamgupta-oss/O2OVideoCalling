class PeerService {
    constructor() {
        // Initialize the peer connection without the check
        this.peer = new RTCPeerConnection({
            iceServers: [
                {
                    urls: [
                        "stun:stun.l.google.com:19302",
                        "stun:global.stun.twilio.com:3478",
                    ]
                }
            ]
        });
    }

    // Method to handle creating an answer
    async getAnswer(offer) {
        if (this.peer) {
            await this.peer.setRemoteDescription(offer); // Directly using the offer object
            const answer = await this.peer.createAnswer();
            await this.peer.setLocalDescription(answer); // No need for new RTCSessionDescription
            return answer;
        }
    }

    // Method to set remote description (renamed for clarity)
    async setRemoteDescription(description) {
        if (this.peer) {
            await this.peer.setRemoteDescription(description); // Directly using the SDP object
        }
    }

    // Method to create an offer
    async getOffer() {
        if (this.peer) {
            const offer = await this.peer.createOffer();
            await this.peer.setLocalDescription(offer); // No need for new RTCSessionDescription
            return offer;
        }
    }
}

export default new PeerService();
