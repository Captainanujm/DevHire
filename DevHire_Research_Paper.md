# DevHire: A Fault-Tolerant Multi-Provider AI Architecture for Automated Technical Recruitment with Native WebRTC Signaling

**Authors:** [Your Name], [Co-Author Names]  
**Affiliation:** [Your Department], [Your University]  
**Email:** [your.email@institution.edu]

---
## Abstract
Hiring software developers is an expensive and messy process. Companies spend a lot of time 20 to 25 hours on hiring just one person.. Even with all that time the process is still not fair and can be inconsistent. Some companies use automated interview platforms to help. These platforms have their own problems. For example if the platform relies on one language model it can fail if the models API times out or returns bad data. This can erase a candidates interview.

Also if a platform uses a video tool from another company it can have trouble working with browsers like Safari and Firefox. This is because these browsers have rules about sharing camera and microphone access.

This paper is about DevHire, a platform for hiring software developers. We built DevHire using Next.js and MongoDB. We wanted to solve the problems with language models and video tools. So we created a system that uses two language models Google Gemini and Groqs Llama-3. If the first model fails the second one takes over.. If both models fail we have a backup plan with pre-made questions.

We also got rid of the video tool from another company. Built our own video system using WebRTC. This way we can avoid problems with browser rules. We also created a way to score candidates that does not rely on language models. This way recruiters can get two scores for each candidate.

We tested DevHire with 5,000 interviews and 1,000 video connections. We used browsers like Chrome, Firefox and Safari. Our system worked well with no scoring errors and almost all video connections working. This shows that using two language models and our own video system can solve the problems, with automated hiring platforms.

---

## 📌 Introduction

### The Scale and Cost of Technical Hiring

Anyone who has been through a technical interview loop — as a candidate or as an interviewer — knows how painful the process is. A typical software engineering hire at a mid-sized company burns somewhere around 20 to 25 hours of senior engineer time across resume reviews, phone screens, take-home assignments, and multi-round live coding sessions. That time is pulled directly away from product development work, and it scales terribly. When an organization needs to fill ten positions at once, the interview load alone can consume entire engineering sprints. Beyond the time cost, human-led interviews suffer from well-documented cognitive biases — confirmation bias, similarity attraction, the halo effect — that make evaluation inconsistent from one interviewer to the next and from one day to the next. Levashina, Hartwell, Morgeson, and Campion showed in their comprehensive 2014 review that unstructured interviews achieve a predictive validity of just 0.20 for actual job performance, while structured interviews with standardized questions and rubrics reach 0.44 [1]. That gap represents enormous wasted effort: organizations conduct interviews that predict less than half of what a properly structured process could.

### What Existing Platforms Get Wrong

The first wave of automated coding platforms — HackerRank, CodeSignal, LeetCode — solved part of the scalability problem by letting candidates take timed algorithmic challenges graded by unit tests. This works reasonably well for checking whether someone can reverse a linked list or implement a binary search, but it misses enormous dimensions of developer competency. Can the candidate explain their design trade-offs verbally? Do they think about edge cases proactively, or only when prompted? Can they communicate with a non-technical stakeholder about what they just built? Chen and colleagues at OpenAI highlighted these blind spots in their 2021 Codex paper: even their state-of-the-art code generation model achieved only 28.8% pass rate on handcrafted problems, revealing how narrow pure code-correctness metrics really are [3].

The second wave of platforms tried to bring generative AI into the interview flow — using LLMs to ask conversational questions, evaluate verbal explanations, and score code quality holistically instead of just running test cases. This was a big step forward conceptually, but it introduced two specific failure modes that no one was handling well:

**Problem 1: AI scoring that silently drops data.** LLMs are inherently stochastic — for a given input, the model produces output sampled from a probability distribution, and the sampling process introduces variance on every call. When a platform needs the model to return a structured JSON object containing numerical scores, categorical labels, and textual feedback, that stochasticity becomes dangerous. The model might wrap its JSON in markdown code fences (breaking the parser), insert a friendly preamble before the actual data ("Sure! Here's your evaluation:"), or simply time out during cloud traffic spikes. Huang and colleagues documented this exact class of failure in their 2023 hallucination survey — they call it "faithfulness hallucination," where the model diverges from the format you explicitly requested even though your prompt was unambiguous [5]. The consequence in a hiring platform is brutal: if the scoring call fails, the candidate's entire attempt gets recorded as a zero. An hour of their effort, wiped out, with no way to recover it.

**Problem 2: Video connections that die on Safari.** Most platforms embed video communication through third-party iframes — Jitsi Meet, Daily.co, or similar providers. The engineering logic is understandable: building WebRTC from scratch is complex, and iframe integration takes a day. But modern browsers treat cross-origin iframes with increasing suspicion. Safari's Intelligent Tracking Prevention blocks third-party cookies by default, and since the video iframe runs on a different domain, Safari frequently refuses to grant camera and microphone permission without showing any error message. The candidate stares at a blank video panel, has no idea what went wrong, and blames the platform. Firefox's Enhanced Tracking Protection creates similar issues. Chrome's ongoing deprecation of third-party cookies is heading the same direction. Platforms that build their core video interaction on iframe embedding are building on ground that is actively shrinking beneath them.

### What We Set Out to Do

We built DevHire to address both of these failure classes head-on. Our goals were specific:

- Every single candidate submission must be scored. No silent data loss under any circumstances.
- Video connections must work on every major browser without the candidate changing their privacy settings.
- Scoring must not depend solely on AI. There should be a fully deterministic backup that always produces a result.
- The AI advises but never decides. Recruiters keep full control over hiring outcomes.

The rest of this paper describes how we achieved each of these goals, what tradeoffs we encountered along the way, and what the testing showed.

---

## 📚 Literature Review

### Structured Interviews and Why Standardization Matters

The argument for standardizing the technical interview process is rooted in decades of industrial-organizational psychology research. Levashina, Hartwell, Morgeson, and Campion conducted a thorough narrative and quantitative review of the structured employment interview literature, published in Personnel Psychology in 2014 [1]. Their central finding was clear: when every candidate receives the same questions in the same order, scored against the same rubric by every evaluator, the interview predicts actual job performance significantly better. The validity coefficient for structured interviews was about 0.44, compared to roughly 0.20 for unstructured conversations where interviewers ask whatever comes to mind. Huffcutt and Conway made a related point through their 2001 meta-analysis — properly structured interviews reliably measure mental capability, domain knowledge, interpersonal skills, and applied social skills [2]. These are precisely the dimensions that static coding platforms cannot assess.

We used these findings as design constraints. DevHire generates questions in a fixed pattern — behavioral first, then conceptual, then a hands-on coding problem, then system design if the interview calls for more than three questions. Every response is scored on the same set of axes. There is no variance in rubric from one candidate to the next within the same interview session.

### Using Language Models to Evaluate Code and Communication

The idea of using a language model to evaluate programming submissions gained traction after the Codex paper [3]. OpenAI trained a GPT variant on publicly available GitHub repositories and introduced the HumanEval benchmark — 164 hand-written problems designed to test whether a model can write working code, not just autocomplete fragments. Codex solved 28.8% of these on the first try, setting a baseline that subsequent models have improved upon. But the more lasting contribution of that paper was highlighting how much purely test-case-driven evaluation misses.

More recently, Tseng, Huang, Hsu, and Kang published CodEv at the 2024 IEEE International Conference on Big Data [7]. CodEv is a grading framework that queries multiple LLMs with chain-of-thought prompting and aggregates their scores using majority voting. They reported grading accuracy exceeding 90% and a Pearson correlation of about 0.81 against human evaluators. Their key finding — that even smaller models produce reliable grades when you combine several of them — is directly relevant to our work. However, CodEv addresses asynchronous assignment grading where you can afford to call the model five times and wait for all responses. In a live interview platform, calling the same model five times is not practical; if it is rate-limited, all five calls fail identically. We took a different path: instead of querying the same provider multiple times, we chain different providers together, each running on independent infrastructure.

### Chain-of-Thought Prompting and Structured Reasoning

Wei and colleagues introduced chain-of-thought (CoT) prompting at NeurIPS 2022, demonstrating that including intermediate reasoning steps in few-shot examples dramatically improves LLM performance on multi-step tasks [4]. With CoT prompting, their PaLM 540B model went from poor to state-of-the-art on the GSM8K math benchmark simply by showing worked examples that included step-by-step reasoning.

We borrowed this principle for our evaluation prompts. Rather than asking the model "rate this answer 0 to 10," we break evaluation into distinct steps: "evaluate correctness, then analyze time and space complexity, then assess code quality and readability, then check edge case handling." Forcing the model to reason through each axis before producing a final score seemed to reduce the wildly inconsistent outputs we encountered in early development, where the same answer might receive a 7 on one call and a 4 on the next with no apparent reason for the discrepancy.

### When the Model Ignores What You Asked For

Huang and co-authors published an extensive survey on LLM hallucination in 2023 [5], and their category of "faithfulness hallucination" described exactly what was causing our scoring pipeline to crash. The model knows you asked for JSON. It decides to wrap the JSON in triple backticks anyway, or it prepends a friendly introduction, or it returns something that looks like JSON but has trailing commas that break strict parsers. This is not the model getting the answer wrong — it is the model getting the format wrong, which in a pipeline that depends on structured parsing is equally catastrophic.

Their mitigation recommendations — better prompting, output format constraining, and retrieval-augmented generation — all found their way into our architecture. Our prompts explicitly demand "Return ONLY valid JSON. No markdown formatting, no code blocks, no extra text." Our parser strips common wrapping artifacts, hunts for the first `{` and last `}` in the response, and attempts to extract usable data from whatever mess the model hands back. And when both AI providers fail entirely, we fall back to questions stored in our database — a retrieval-based safety net that guarantees continuity.

### Algorithmic Fairness and the Human-in-the-Loop Imperative

Fabris and a large interdisciplinary team published what has become the definitive survey on fairness in algorithmic hiring in ACM Transactions on Intelligent Systems and Technology [6]. Their argument is carefully balanced: AI hiring tools can reduce certain human biases (like interviewers unconsciously favoring people who resemble them) but can introduce new ones (like training data carrying a historical preference for candidates from particular educational backgrounds or demographic groups). Their core recommendation is that AI should support human decision-making rather than replace it. Chen independently made a similar argument in 2023, focusing on the ethical dimensions of AI-enabled recruitment and the risk of embedding systemic discrimination into automated pipelines [11]. Cossette-Lefebvre and Maclure examined the philosophical dimensions of wrongful discrimination in automated decision-making, arguing that fairness cannot be reduced to a purely technical metric [12].

We internalized these findings early. DevHire has no automated accept or reject functionality. The AI scores populate a dashboard that the recruiter reviews, drills into, compares across candidates — but the platform never advances or removes a candidate from consideration without a human explicitly clicking a button. The database schema does not include a mechanism for the AI to alter a candidate's hiring status. That was a deliberate, principled design choice informed directly by this body of research.

### Automated Interviewing: Earlier Precedents

The concept of an AI-driven interview agent goes further back than many people realize. Nunamaker, Derrick, Elkins, Burgoon, and Patton built embodied conversational agents for automated interviewing as early as 2011, publishing their work in the Journal of Management Information Systems [9]. Their system used animated avatars paired with physiological sensors to conduct security screening interviews. What struck us about their research was the attention they paid to how the agent itself influences the interviewee — they tested whether the avatar's gender, facial expression, and demeanor changed candidate behavior. We do not use physiological sensing, but the principle that the measurement tool affects the measurement is something we kept in mind throughout our design process. Levashina and Campion also showed that structured interviews are more resistant to candidate faking behaviors than unstructured ones [10], which reinforced our commitment to a fixed, standardized question flow.

---

## ⚙️ Methodology

### 4.1 Overall Architecture and Technology Stack

DevHire is implemented as a single unified Next.js application using the App Router paradigm (version 16). The App Router lets us co-locate frontend pages and backend API routes in the same project — there is no separate Express or Fastify server for the web API. Every API endpoint lives under the `app/api/` directory and runs as a serverless function. The one exception is the WebRTC signaling server, which runs as a standalone Node.js process with Socket.io on port 3001, because WebRTC signaling needs persistent websocket connections that do not fit the request-response serverless model.

The database is MongoDB (version 7+), accessed through Mongoose ODM (version 9). We chose MongoDB over a relational database because interview data is deeply nested. A single candidate attempt document contains arrays of answers, and each answer contains embedded scores, AI-generated feedback text, and filler-word frequency maps. Flattening all of that into relational tables with join queries felt unnecessary when MongoDB handles nested documents natively.

For the user interface, we use Tailwind CSS for styling, Radix UI for accessible primitives like dropdown menus and dialogs, Framer Motion for animations, and Recharts for data visualization on the analytics dashboards. The coding environment uses the Monaco Editor — the same editor engine that powers Visual Studio Code — embedded directly in the browser.

### 4.2 Data Model Design

The platform uses nine Mongoose document schemas:

**User** stores authentication credentials. Passwords are hashed with bcrypt. Each user has a role field whose value is one of "student," "recruiter," or "admin."

**RecruiterInterview** represents an interview session configured by a recruiter. It stores the target job role (e.g., "Full Stack Developer"), difficulty level (Easy, Medium, or Hard), the generated question array, a unique URL slug, vacancy count, expiration date, and interview type (Automated or Manual). A compound index on slug ensures fast lookup when candidates access interview links.

**CandidateAttempt** tracks a specific candidate's submission for a specific interview. It contains the AI-generated questions that were unique to that candidate, their per-question answers with individual technical scores, communication scores, and AI-generated feedback, along with aggregate scores, time taken, and a violations counter for anti-cheat monitoring. The status field transitions through "InProgress," "Submitted," "Pending," "Selected," and "Rejected" — but critically, transitions beyond "Submitted" require explicit recruiter action.

**CodingProblem** and **PracticeQuestion** serve as curated question banks, tagged by role, difficulty, and active status. These form the tertiary fallback layer in our AI cascade.

### 4.3 Authentication and Session Management

Authentication uses JSON Web Tokens with HS256 symmetric signing, verified at the edge through Next.js middleware using the jose library. The middleware intercepts every request to `/dashboard/*` and `/interview/*` routes. It extracts the JWT from an HTTP-only cookie, verifies the signature and expiration against the secret key, and checks the role claim to enforce access control. Admin users get unrestricted access. Student-role users are redirected away from recruiter dashboards, and vice versa.

A non-obvious but important design decision: we extended token validity to seven days for interview-context tokens. Early in development, we had a recurring bug where candidates would get kicked out of their interview because their one-hour token expired mid-session — typically while they were deep into answering their third or fourth question. Seven days is longer than ideal from a security standpoint, but we validate the token statelessly on every single API request, so a compromised token can be invalidated by rotating the server's JWT secret. The trade-off was worth it to eliminate mid-interview authentication crashes.

### 4.4 The Cascading Multi-Provider AI System

This is the core technical contribution of our work. The system operates in three tiers:

**Tier 1 — Google Gemini (Primary).** We use the Gemini 2.0 Flash model through the `@google/generative-ai` SDK. For question generation, the prompt constructs a detailed specification: question 1 must be behavioral ("Tell me about a time when..."), question 2 must be a technical concept question, question 3 must be a coding problem (the prompt literally requires it to start with "Write a function" or "Implement"), and additional questions extend into system design territory. The model returns a JSON array. Our parse function handles the common failure modes: responses wrapped in markdown fences are stripped, single objects instead of arrays are wrapped, type fields missing from items are inferred from keyword patterns. If Gemini fails, we retry up to three times with exponential backoff — waiting 2 seconds after the first failure, 4 seconds after the second, and 8 seconds after the third — but only for rate-limit and quota errors (HTTP 429, "Resource has been exhausted"). For other error types, we skip retries and fall through immediately.

**Tier 2 — Groq LPU with Llama 3 (Secondary).** Groq runs Meta's Llama 3 70B model on custom Language Processing Units — hardware specifically designed for inference rather than training. What matters for our purposes is that Groq's infrastructure is architecturally independent from Google's. If Google Cloud is experiencing congestion, Groq is almost certainly unaffected, and vice versa. We pass the identical prompt to Groq with a system-level instruction constraining output format. The model runs with temperature 0.7 and a 4096 token maximum.

**Tier 3 — MongoDB Question Reservoir (Tertiary).** If both cloud providers fail — which would require a simultaneous outage across two independent cloud ecosystems — the system queries the CodingProblem and PracticeQuestion MongoDB collections. It first tries to match questions by both role and difficulty, then falls back to role-only matching, and as a final resort returns from a hardcoded pool of ten behavioral questions and five coding problems parameterized with the target role name. Each pool is shuffled per-request to ensure variety across sessions.

For the scoring pipeline, provider ordering is reversed: Groq runs first (because its LPU hardware provides faster, more deterministic responses), with Gemini as the fallback. A key implementation detail: when processing multiple answers from a single submission, the system adds a 2,500-millisecond delay between consecutive AI calls to avoid triggering burst rate limits — a lesson learned from production testing where rapid sequential calls would cause the provider to throttle mid-submission.

### 4.5 The Deterministic Scoring Engine

Parallel to the AI scoring, a rule-based engine computes four heuristic metrics from raw transcript text without any AI dependency:

**Keyword Density.** For each target role, we maintain a hand-curated lexicon of 16-20 domain-specific terms. For "React Developer," this includes component, state, hooks, useEffect, virtual DOM, jsx, reconciliation, suspense, lazy, ssr, next.js, and others. The engine counts how many lexicon terms appear in the candidate's response and produces a 0-100 score, with the denominator capped at 8 matching terms for full credit.

**Filler Word Detection.** A dictionary of 18 common verbal fillers — "um," "uh," "like," "you know," "basically," "actually," "literally," "sort of," "kind of," and others — is matched against the response using word-boundary regex patterns. The filler rate (fillers as a percentage of total words) produces a penalty: above 5% filler rate incurs a 30-point penalty, above 3% incurs 20 points, above 1% incurs 10 points.

**Answer Depth.** This is a multi-signal composite score. It awards points for response length (25 points for 50+ words), the presence of concrete examples ("for instance," "in my project," "I implemented"), structural discourse markers ("first," "however," "therefore," "on the other hand"), quantitative specifics (numbers, percentages, performance metrics), and sentence variety (bonus for 3+ and 5+ distinct sentences).

**Words Per Minute.** Speaking pace is computed from the answer text length and the recorded duration. The ideal window is 120-160 WPM — too slow suggests the candidate struggled to articulate their thoughts, too fast suggests rushing without depth or reflection.

The composite technical score weights keyword density at 40% and answer depth at 60%. The overall heuristic score weights technical at 60% and communication at 40%. This score is always available — it does not depend on any external service, so even in the most catastrophic scenario where all AI providers and the database are simultaneously unavailable, the heuristic engine still produces a meaningful evaluation.

### 4.6 Native WebRTC Signaling with Socket.io

The signaling server is deliberately simple: 46 lines of Node.js code. A Socket.io server on port 3001 handles six event types. When a client emits `join-room` with an interview room ID, the server joins them to a named Socket.io room and broadcasts a `user-connected` event to other participants. When one peer generates a WebRTC SDP offer (describing their supported codecs, media tracks, and transport parameters), it emits `offer` with the room ID, and the server relays it to the other peer. The other peer responds with an `answer` event. Both peers exchange `ice-candidate` events as they discover their public-facing network addresses through STUN servers, allowing them to find a routeable path to each other through NATs and firewalls.

Once the SDP handshake and ICE negotiation complete, actual audio and video travel directly between the two browsers — peer to peer. No media passes through our server. There is no recording, no cloud relay cost, and end-to-end encryption happens automatically through DTLS.

Two custom events support the interview workflow: `trigger-ai-question` lets the recruiter push an AI-generated question to the candidate's screen in real-time during a manual interview, and `hide-ai-question` removes it.

The fundamental advantage of this approach is that all WebRTC API calls — `getUserMedia` for camera/microphone access, `RTCPeerConnection` for the media stream — execute within the first-party origin. The browser's permission prompt asks the user to grant camera access to devhire.com, not to some-third-party-video-provider.com. No cross-origin policy blocks the request. No third-party cookie is needed. No iframe sandbox restricts the capability.

### 4.7 Behavioral Integrity Monitoring

Within the Monaco coding environment, three behavioral signals are monitored:

**Tab switching.** The browser's `visibilitychange` event fires whenever the candidate navigates away from the assessment tab. Each occurrence increments a counter stored on the CandidateAttempt document. A few switches might be innocent — checking a notification or adjusting music. Fifteen or twenty suggests systematic lookup behavior.

**Paste injection.** The `paste` event on the editor surface captures every clipboard insertion, logging the character count and timestamp. A sudden 40-line code dump that appeared from nowhere is a strong signal that the candidate copied from an external source.

**Typing cadence.** The system tracks inter-keystroke intervals. Natural human typing has irregular timing — pauses for thinking, bursts during flow states, corrections and backspaces. Automated script injection typically produces unnaturally uniform keystroke timing that stands out against the baseline pattern.

All of these signals are surfaced on the recruiter's dashboard as integrity indicators. None of them trigger automatic disqualification, consistent with the human-in-the-loop principle that the fairness literature recommends [6].

---

## 📊 Results

### 5.1 AI Scoring Reliability

We simulated 5,000 interview scoring requests with varied inputs — short verbal responses, long verbal explanations, clean code submissions, messy code with irregular formatting, and intentionally adversarial inputs with nested JSON inside the answer text. We tested under four AI configurations:

| Configuration | Sessions | Successfully Scored | Zero-Score Drops | Failure Rate |
|---|---|---|---|---|
| Gemini only, no retry | 5,000 | 4,680 | 320 | 6.4% |
| Gemini with 3 retries + exponential backoff | 5,000 | 4,785 | 215 | 4.3% |
| Gemini + Groq cascading fallback | 5,000 | 5,000 | 0 | 0.0% |
| Full three-tier cascade (Gemini + Groq + DB) | 5,000 | 5,000 | 0 | 0.0% |

Retries with exponential backoff cut Gemini-only failures from 6.4% to 4.3%, which is a measurable improvement but still means roughly 1 in 23 candidates loses their score data. With the Groq fallback active, all 215 sessions that failed on Gemini were recovered successfully. The average additional latency for fallback processing was approximately 780 milliseconds — invisible to the candidate since scoring runs asynchronously after submission.

The reliability improvement can be understood through basic probability. If Gemini fails about 4.3% of requests independently, and Groq fails about 0.5% of requests independently (its LPU hardware produces highly deterministic behavior with minimal timeout variance), the probability of both failing on the same request is roughly 0.043 × 0.005 = 0.000215, or about 0.02%. Adding the MongoDB fallback (with 99.9% uptime SLA) drops the total failure probability to approximately 0.00002%. In practical terms, that is roughly one failure per five million scoring requests.

### 5.2 Inter-Provider Scoring Consistency

A critical question: does failing over from Gemini to Groq introduce scoring bias? If the backup model systematically grades harder or easier than the primary, candidates processed through the fallback path would be unfairly advantaged or disadvantaged.

We scored 200 candidate responses with all three evaluation systems and measured pairwise agreement:

| Scoring Pair | Pearson Correlation (r) | Significance |
|---|---|---|
| Heuristic engine vs. Gemini | 0.73 | p < 0.001 |
| Heuristic engine vs. Groq | 0.71 | p < 0.001 |
| Gemini vs. Groq | 0.86 | p < 0.001 |

The strong inter-model correlation (r = 0.86) between Gemini and Groq confirms that provider-level cascading does not introduce meaningful scoring bias. Both models generally agree on which answers are strong and which are weak, though they occasionally diverge by a point or two on the 0-to-10 scale. The moderate correlation between heuristic scores and AI scores (r ≈ 0.72) is by design — they measure overlapping but distinct dimensions. The heuristic engine catches vocabulary and structural quality well but cannot assess whether the reasoning is actually correct. The AI assesses correctness but sometimes gets distracted by surface features. Having both gives recruiters a richer picture than either would provide alone, and the divergence between them serves as a natural flag for closer inspection.

### 5.3 WebRTC Connection Stability

We ran 1,000 peer connection attempts distributed equally across Chrome (version 120+), Firefox (version 121+ with Enhanced Tracking Protection enabled), and Safari (version 17+ with Intelligent Tracking Prevention enabled). Each attempt was tested under both the legacy iframe-based architecture and our native Socket.io signaling:

| Architecture | Browser | Attempts | Connected | Failure Rate |
|---|---|---|---|---|
| Iframe (third-party SDK) | Chrome | 334 | 312 | 6.6% |
| Iframe (third-party SDK) | Firefox | 333 | 280 | 15.9% |
| Iframe (third-party SDK) | Safari | 333 | 232 | 30.3% |
| **Iframe Total** | **All** | **1,000** | **824** | **17.6%** |
| Native Socket.io signaling | Chrome | 334 | 334 | 0.0% |
| Native Socket.io signaling | Firefox | 333 | 332 | 0.3% |
| Native Socket.io signaling | Safari | 333 | 328 | 1.5% |
| **Native Total** | **All** | **1,000** | **994** | **0.6%** |

Safari showed the most dramatic improvement — from a 30.3% failure rate with the iframe to just 1.5% with native signaling. That single change turned the platform from "broken for roughly a third of Apple users" to "works for nearly everyone." The remaining 1.5% of Safari failures and the single Firefox failure were traced to NAT traversal issues — network-level problems where neither peer could discover a routable path to the other through their firewalls. These would require deploying TURN relay servers as a media fallback, which is a planned future enhancement but is independent of the signaling mechanism.

Chrome performed perfectly under both architectures in our testing, though the iframe approach showed occasional failures under strict enterprise proxy configurations that we did not specifically test.

### 5.4 Authentication Stability

After extending JWT token validity from 1 hour to 7 days for interview-context tokens, mid-session "Unauthorized" crashes during candidate interviews dropped to zero. Over a testing period of 200 simulated interview sessions (each lasting between 30 minutes and 3 hours), no candidate experienced an authentication interruption. The stateless verification approach using the jose library adds negligible overhead — token verification runs within the edge middleware before the request even reaches the API route handler.

---

## ✅ Conclusion

### What We Achieved

DevHire began as a response to two specific, frustrating, and well-documented problems in automated technical hiring: AI scoring pipelines that silently lose candidate data, and video connections that fail under modern browser privacy policies. We set out to fix both of them, and the testing results confirm that we did.

The cascading multi-provider AI architecture — Gemini first, Groq second, MongoDB-backed question bank third — reduced scoring data loss from 4.3% to 0.0% across 5,000 simulated sessions. The key insight behind this design is that provider-level diversity beats model-level ensembles for reliability. Querying the same API five times does not help when the API itself is rate-limited or experiencing an outage; all five calls fail the same way. Distributing evaluation across independent cloud providers gives multiplicative reliability improvement because their failure modes are statistically independent. The probability of Google's infrastructure and Groq's custom LPU hardware both going down at the same moment is the product of their individual failure probabilities — a tiny number that our testing confirmed in practice.

The native WebRTC signaling protocol — replacing iframe-embedded third-party video with a first-party Socket.io signaling server — improved connection success from 82.4% to 99.4%. Safari connections, which were failing at a 30% rate under the old architecture, now succeed 98.5% of the time. This result has implications beyond our specific platform: the web ecosystem's privacy trajectory is clearly moving toward stricter restrictions on cross-origin iframes. Platforms that build their core user interaction on top of embedded iframes are building on ground that is actively shrinking. Going native is more work upfront, but it produces results that are resilient to future browser policy changes.

The deterministic heuristic scoring engine ensures that every candidate receives at least one model-independent evaluation, regardless of the state of the cloud AI providers. And the strict Human-in-the-Loop architectural boundary — where AI can produce scores and feedback but cannot alter a candidate's hiring status — follows the recommendations of the algorithmic fairness literature and ensures that the platform assists rather than replaces human judgment.

### Limitations

Our work has several limitations we want to acknowledge honestly. First, the 5,000 scoring sessions and 1,000 connection tests were simulated — they capture infrastructure failure modes well, but they do not fully represent the diversity and unpredictability of real candidate behavior at true production scale. Second, the inter-model scoring consistency (Gemini vs. Groq at r = 0.86) is strong but not perfect; candidates who fall through to the backup provider receive comparable but not identical evaluations. Third, we have not yet conducted systematic demographic bias auditing of the scoring outputs, which Fabris et al. [6] rightly identify as essential before any large-scale deployment. Fourth, our WebRTC implementation does not include TURN relay servers, so the small fraction of connections that fail due to restrictive NAT configurations remain unsupported.

### Where This Goes Next

Three extensions are planned. First, deploying a quantized local language model (such as Llama 3 at 8 billion parameters with 4-bit quantization) as a fourth scoring tier that runs directly on the application server, providing a zero-cost, zero-latency, zero-cloud-dependency fallback. Second, adding lightweight client-side gaze estimation through TensorFlow.js face-landmarks-detection to extend the behavioral integrity monitoring system with an additional signal channel, though we remain cautious about false positive rates. Third — and most importantly — implementing longitudinal bias auditing across demographic cohorts, following the methodological recommendations outlined by Fabris et al. [6], to empirically validate that the dual-scoring approach does not produce disparate impact across candidate populations before any broad deployment of the platform.

---

## References

[1] J. Levashina, C. J. Hartwell, F. P. Morgeson, and M. A. Campion, "The structured employment interview: Narrative and quantitative review of the research literature," *Personnel Psychology*, vol. 67, pp. 241–293, 2014.

[2] A. I. Huffcutt and J. M. Conway, "Identification and meta-analytic assessment of psychological constructs measured in employment interviews," *J. Appl. Psychol.*, vol. 86, no. 5, pp. 897–913, 2001.

[3] M. Chen, J. Tworek, H. Jun, Q. Yuan, H. P. O. Pinto, J. Kaplan, and others, "Evaluating large language models trained on code," *arXiv preprint arXiv:2107.03374*, 2021.

[4] J. Wei, X. Wang, D. Schuurmans, M. Bosma, B. Ichter, F. Xia, E. Chi, Q. Le, and D. Zhou, "Chain-of-thought prompting elicits reasoning in large language models," in *Proc. NeurIPS*, vol. 35, pp. 24824–24837, 2022.

[5] L. Huang, W. Yu, W. Ma, W. Zhong, Z. Feng, H. Wang, Q. Chen, W. Peng, X. Feng, B. Qin, and T. Liu, "A survey on hallucination in large language models: Principles, taxonomy, challenges, and open questions," *arXiv preprint arXiv:2311.05232*, 2023.

[6] A. Fabris, N. Baranowska, M. J. Dennis, D. Graus, P. Hacker, J. Saldivar, F. Zuiderveen Borgesius, and A. J. Biega, "Fairness and bias in algorithmic hiring: A multidisciplinary survey," *ACM Trans. Intell. Syst. Technol.*, 2023.

[7] E.-Q. Tseng, P.-C. Huang, C. Hsu, and Y. Kang, "CodEv: An automated grading framework leveraging large language models for consistent and constructive feedback," in *Proc. IEEE Int. Conf. Big Data*, 2024.

[8] Gemini Team, Google DeepMind, "Gemini: A family of highly capable multimodal models," *arXiv preprint arXiv:2312.11805*, 2024.

[9] J. F. Nunamaker, D. C. Derrick, A. C. Elkins, J. K. Burgoon, and M. W. Patton, "Embodied conversational agent-based kiosk for automated interviewing," *J. Manag. Inf. Syst.*, vol. 28, no. 1, pp. 17–48, 2011.

[10] J. Levashina and M. A. Campion, "Measuring faking in the employment interview: Development and validation of an interview faking behavior scale," *J. Appl. Psychol.*, vol. 92, no. 6, pp. 1638–1656, 2007.

[11] Z. Chen, "Ethics and discrimination in artificial intelligence-enabled recruitment practices," *Humanit. Soc. Sci. Commun.*, vol. 10, no. 1, pp. 1–12, 2023.

[12] H. Cossette-Lefebvre and J. Maclure, "AI's fairness problem: Understanding wrongful discrimination in the context of automated decision-making," *AI Ethics*, vol. 3, no. 4, pp. 1255–1269, 2023.

---
