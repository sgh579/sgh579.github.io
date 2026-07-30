---
title: "What is a generative model?"
date: 2026-07-30
excerpt: "A probabilistic definition of generative models, how they differ from discriminative models, and how the main classical and modern model families fit together."
lang: en
tags:
  - machine learning
  - generative models
---

A generative model is a model of how observations could have been produced. It
learns a probability distribution, a stochastic process, or at least a sampling
mechanism that resembles the process behind the training data.

Let the observations come from an unknown distribution
\\(p_{\mathrm{data}}(x)\\). Given a dataset

$$
\mathcal D=\{x_1,x_2,\ldots,x_N\},
$$

the idealised goal is to learn a model \\(p_\theta(x)\\) such that

$$
p_\theta(x)\approx p_{\mathrm{data}}(x).
$$

After training, a new sample can be drawn as

$$
x_{\mathrm{new}}\sim p_\theta(x).
$$

The sample need not have appeared in the training set, but it should obey the
statistical structure learned from that set. This definition is broader than
"a model that makes images or text": Gaussian mixture models, hidden Markov
models, topic models, language models, GANs, and diffusion models are all
generative models, although they represent and learn distributions in different
ways.

## Marginal, joint, conditional, and latent-variable models

A model may describe:

- the data distribution \\(p_\theta(x)\\);
- the joint distribution \\(p_\theta(x,y)\\);
- or a conditional distribution \\(p_\theta(x\mid c)\\), where \\(c\\) might be
  a class label, a text prompt, another image, or any other context.

Many generative models introduce a latent variable \\(z\\):

$$
z\sim p(z),\qquad x\sim p_\theta(x\mid z),
$$

which implies

$$
p_\theta(x)=\int p(z)p_\theta(x\mid z)\,dz.
$$

The latent variable may encode factors such as pose, style, topic, or other
unobserved structure. It does not automatically have a human-readable meaning;
interpretability depends on the model, objective, data, and inductive biases.

There is also an important distinction between **explicit** and **implicit**
models. An explicit model defines a density or probability mass
\\(p_\theta(x)\\), even when evaluating it is difficult. An implicit model may
only define a sampling procedure, for example

$$
z\sim p(z),\qquad x=G_\theta(z).
$$

The latter still induces a distribution over \\(x\\), although its normalized
density may not be available. GANs are the standard example. Therefore,
"generative" does not mean "has a tractable likelihood"; it means that the model
represents a data-generating distribution or mechanism and can use it to
produce samples.

## Generative versus discriminative

A discriminative model learns a conditional relationship such as
\\(p_\theta(y\mid x)\\), or directly learns a decision boundary. A generative
classifier instead models \\(p_\theta(x,y)\\), often through

$$
p_\theta(x,y)=p_\theta(y)p_\theta(x\mid y),
$$

and obtains the classifier with Bayes' rule. Naive Bayes is generative in this
sense, whereas logistic regression is discriminative.

The distinction concerns what distribution or decision rule is learned, not
whether the visible output looks "creative." A GAN contains a discriminative
network, but the complete adversarial system trains a generator. Conversely, a
large neural network is not generative merely because it is capable of producing
a vector.

An autoregressive language model provides another useful example. Next-token
prediction defines the joint probability of a sequence through the chain rule:

$$
p_\theta(x_1,\ldots,x_T)
=\prod_{t=1}^{T}p_\theta(x_t\mid x_{<t}).
$$

It is therefore a generative model of text, despite being trained as a sequence
of classification problems.

## Classical generative models

Classical probabilistic models make the assumed generation process relatively
visible.

- A **Gaussian mixture model** assumes that a latent component is selected and
  then generates an observation from its Gaussian distribution:

  $$
  p(x)=\sum_{k=1}^{K}\pi_k\mathcal N(x\mid\mu_k,\Sigma_k).
  $$

  Mixture models are commonly fitted with the expectation-maximization
  algorithm formalised by
  [Dempster, Laird, and Rubin (1977)](https://doi.org/10.1111/j.2517-6161.1977.tb01600.x).

- A **hidden Markov model** generates a sequence through latent states with
  Markov transitions and state-dependent emissions. A standard account is
  [Rabiner's HMM tutorial (1989)](https://doi.org/10.1109/5.18626).

- A **Bayesian network** factorises a joint distribution according to a directed
  acyclic graph:

  $$
  p(x_1,\ldots,x_n)
  =\prod_i p(x_i\mid\operatorname{Pa}(x_i)).
  $$

  Pearl's
  [*Probabilistic Reasoning in Intelligent Systems* (1988)](https://doi.org/10.1016/C2009-0-27609-4)
  established this graphical perspective.

- **Latent Dirichlet allocation** generates the words in each document from a
  mixture of latent topics
  ([Blei, Ng, and Jordan, 2003](https://www.jmlr.org/papers/v3/blei03a.html)).

- **Energy-based models** assign low energy to plausible configurations:

  $$
  p_\theta(x)=\frac{\exp[-E_\theta(x)]}{Z_\theta}.
  $$

  Boltzmann machines
  ([Ackley, Hinton, and Sejnowski, 1985](https://doi.org/10.1207/s15516709cog0901_7))
  and deep belief networks
  ([Hinton, Osindero, and Teh, 2006](https://doi.org/10.1162/neco.2006.18.7.1527))
  are influential neural examples. Their main difficulty is often inference or
  the partition function \\(Z_\theta\\), rather than the absence of a
  probabilistic definition.

These models remain useful because their conditional assumptions and latent
structure can be inspected directly. Their fixed distributional forms may,
however, be too restrictive for high-dimensional images, audio, or natural
language.

## Modern deep generative model families

### Variational autoencoders

A variational autoencoder (VAE) combines a latent generative model
\\(p_\theta(x\mid z)\\) with an approximate posterior
\\(q_\phi(z\mid x)\\). It maximises the evidence lower bound

$$
\mathcal L_{\mathrm{ELBO}}
=
\mathbb E_{q_\phi(z\mid x)}
[\log p_\theta(x\mid z)]
-
D_{\mathrm{KL}}
\left(q_\phi(z\mid x)\,\|\,p(z)\right).
$$

The reparameterisation method in
[Kingma and Welling (2014)](https://arxiv.org/abs/1312.6114) made this approach
scalable with gradient-based optimisation. VAEs offer fast sampling and a
useful latent space, but the approximate posterior and likelihood objective can
produce overly smooth samples in some settings.

### Generative adversarial networks

A GAN trains a generator \\(G\\) against a discriminator \\(D\\):

$$
\min_G\max_D
\mathbb E_{x\sim p_{\mathrm{data}}}\log D(x)
+
\mathbb E_{z\sim p(z)}\log[1-D(G(z))].
$$

The original formulation is due to
[Goodfellow et al. (2014)](https://proceedings.neurips.cc/paper_files/paper/2014/hash/f033ed80deb0234979a61f95710dbe25-Abstract.html).
GANs can generate a sample in one network pass and became especially strong at
sharp image synthesis, as illustrated by
[StyleGAN (Karras, Laine, and Aila, 2019)](https://openaccess.thecvf.com/content_CVPR_2019/html/Karras_A_Style-Based_Generator_Architecture_for_Generative_Adversarial_Networks_CVPR_2019_paper).
They do not normally provide a tractable likelihood, and adversarial training
can be unstable or fail to cover modes of the data distribution.

### Autoregressive models

Autoregressive models use the chain-rule factorisation above. The probability
is explicit and maximum-likelihood training is straightforward, but sampling is
usually sequential.

Important examples include the neural language model of
[Bengio et al. (2003)](https://www.jmlr.org/papers/v3/bengio03a.html),
[PixelRNN/PixelCNN](https://proceedings.mlr.press/v48/oord16.html) for images,
[WaveNet](https://arxiv.org/abs/1609.03499) for audio, and the
[Transformer](https://proceedings.neurips.cc/paper_files/paper/2017/hash/3f5ee243547dee91fbd053c1c4a845aa-Abstract.html),
whose causally masked decoder underlies the GPT family. Training can process
many positions in parallel, but ancestral generation still produces one token
or element after another.

### Normalizing flows

A normalizing flow transforms a simple random variable through an invertible
map:

$$
x=f_\theta(z),\qquad z\sim p(z).
$$

The change-of-variables formula gives an exact likelihood:

$$
\log p_X(x)
=
\log p_Z(f_\theta^{-1}(x))
+
\log\left|
\det\frac{\partial f_\theta^{-1}(x)}{\partial x}
\right|.
$$

[Real NVP](https://arxiv.org/abs/1605.08803) and
[Glow](https://proceedings.neurips.cc/paper_files/paper/2018/hash/d139db6a236200b21cc7f752979132d0-Abstract.html)
are representative image models. Flows provide exact density evaluation,
sampling, and latent inference, but invertibility and a tractable Jacobian
restrict the architecture.

### Diffusion and score-based models

A diffusion model gradually corrupts data with noise,

$$
x_0\rightarrow x_1\rightarrow\cdots\rightarrow x_T,
$$

and learns the reverse process that maps noise back to data. The modern line
starts with
[Sohl-Dickstein et al. (2015)](https://proceedings.mlr.press/v37/sohl-dickstein15.html)
and was made practically influential by
[DDPM (Ho, Jain, and Abbeel, 2020)](https://proceedings.neurips.cc/paper/2020/hash/4c5bcfec8584af0d967f1ab10179ca4b-Abstract.html).

Score-based models learn the gradient of a noisy log density. The stochastic
differential equation formulation of
[Song et al. (2021)](https://arxiv.org/abs/2011.13456) unifies much of the
score-based and diffusion view. Latent diffusion moves the denoising process
from pixels to a learned representation, reducing cost and enabling flexible
conditioning
([Rombach et al., 2022](https://openaccess.thecvf.com/content/CVPR2022/html/Rombach_High-Resolution_Image_Synthesis_With_Latent_Diffusion_Models_CVPR_2022_paper.html)).

Diffusion models tend to have stable training, strong mode coverage, and
high-quality conditional generation. Their traditional weakness is iterative
sampling, which requires many network evaluations.

### Flow matching and rectified flow

Flow matching learns a time-dependent velocity field that transports a simple
source distribution to the data distribution:

$$
\frac{dx_t}{dt}=v_\theta(x_t,t).
$$

[Lipman et al. (2023)](https://arxiv.org/abs/2210.02747) introduced a
simulation-free regression objective for training continuous normalizing flows
along chosen probability paths.
[Rectified flow](https://arxiv.org/abs/2209.03003) focuses on learning straighter
transport paths, which can reduce numerical integration steps. These methods
are closely related to diffusion probability-flow ODEs, but they are best
understood as learning transport dynamics rather than a discrete denoising
chain.

### Consistency models

[Consistency models](https://proceedings.mlr.press/v202/song23a.html) learn
mappings that agree along a probability-flow trajectory. They support one-step
or few-step generation and may be trained from a diffusion model or directly.
They trade some of the simple, well-tested multi-step diffusion procedure for a
more demanding training or distillation problem.

## Comparing the families

| Family | Density or probability | Typical sampling | Main strength | Main limitation |
|---|---|---:|---|---|
| GMM, HMM, graphical models | Explicit | Fast | Interpretable assumptions | Restricted high-dimensional capacity |
| VAE | Explicit latent model; marginal likelihood is usually approximated | One decoder pass | Structured latent space and fast inference | Approximation gap; sometimes smooth samples |
| GAN | Implicit | One generator pass | Sharp samples and fast generation | No tractable likelihood; unstable training |
| Autoregressive | Exact factorisation | Sequential | Stable likelihood training | Slow ancestral generation |
| Normalizing flow | Exact via change of variables | Parallel or a short transform chain | Exact likelihood and invertibility | Architectural constraints |
| Diffusion/score | Reverse stochastic process; likelihood is indirect | Many denoising steps | Quality, coverage, and conditioning | Iterative sampling cost |
| Flow matching/rectified flow | Continuous transport; likelihood is available for suitable CNFs | ODE integration | Flexible paths and fewer-step potential | Numerical integration and path design |
| Consistency model | Usually used as a direct sampler | One or a few steps | Very fast sampling | More involved training or distillation |
{: .generative-model-comparison }

This table describes typical designs, not hard boundaries. Hybrids are common:
latent diffusion includes an autoencoder, a text-conditioned image system may
use a Transformer as its conditioner, and a modern multimodal system may combine
autoregressive, diffusion, flow, and adversarial objectives.

## A practical definition

A useful test is to ask three questions:

1. **What distribution or stochastic mechanism is being represented?**
2. **How does the training objective make that mechanism resemble the data?**
3. **How are new samples drawn, and can their likelihood be evaluated?**

If these questions have coherent answers, the model is generative. The defining
idea is not that it memorises examples or produces impressive media; it is that
it learns enough of a data-generating distribution or mechanism to create new,
plausible observations.

## References

- Dempster, A. P., Laird, N. M., and Rubin, D. B. [“Maximum Likelihood from Incomplete Data via the EM Algorithm.”](https://doi.org/10.1111/j.2517-6161.1977.tb01600.x) *Journal of the Royal Statistical Society: Series B*, 39(1), 1–38, 1977.
- Rabiner, L. R. [“A Tutorial on Hidden Markov Models and Selected Applications in Speech Recognition.”](https://doi.org/10.1109/5.18626) *Proceedings of the IEEE*, 77(2), 257–286, 1989.
- Pearl, J. [*Probabilistic Reasoning in Intelligent Systems: Networks of Plausible Inference.*](https://doi.org/10.1016/C2009-0-27609-4) Morgan Kaufmann, 1988.
- Blei, D. M., Ng, A. Y., and Jordan, M. I. [“Latent Dirichlet Allocation.”](https://www.jmlr.org/papers/v3/blei03a.html) *Journal of Machine Learning Research*, 3, 993–1022, 2003.
- Ackley, D. H., Hinton, G. E., and Sejnowski, T. J. [“A Learning Algorithm for Boltzmann Machines.”](https://doi.org/10.1207/s15516709cog0901_7) *Cognitive Science*, 9(1), 147–169, 1985.
- Hinton, G. E., Osindero, S., and Teh, Y.-W. [“A Fast Learning Algorithm for Deep Belief Nets.”](https://doi.org/10.1162/neco.2006.18.7.1527) *Neural Computation*, 18(7), 1527–1554, 2006.
- Bengio, Y., Ducharme, R., Vincent, P., and Jauvin, C. [“A Neural Probabilistic Language Model.”](https://www.jmlr.org/papers/v3/bengio03a.html) *Journal of Machine Learning Research*, 3, 1137–1155, 2003.
- Kingma, D. P., and Welling, M. [“Auto-Encoding Variational Bayes.”](https://arxiv.org/abs/1312.6114) *International Conference on Learning Representations*, 2014.
- Goodfellow, I. et al. [“Generative Adversarial Nets.”](https://proceedings.neurips.cc/paper_files/paper/2014/hash/f033ed80deb0234979a61f95710dbe25-Abstract.html) *Advances in Neural Information Processing Systems 27*, 2014.
- van den Oord, A., Kalchbrenner, N., and Kavukcuoglu, K. [“Pixel Recurrent Neural Networks.”](https://proceedings.mlr.press/v48/oord16.html) *Proceedings of the 33rd International Conference on Machine Learning*, 1747–1756, 2016.
- van den Oord, A. et al. [“WaveNet: A Generative Model for Raw Audio.”](https://arxiv.org/abs/1609.03499) arXiv:1609.03499, 2016.
- Vaswani, A. et al. [“Attention Is All You Need.”](https://proceedings.neurips.cc/paper_files/paper/2017/hash/3f5ee243547dee91fbd053c1c4a845aa-Abstract.html) *Advances in Neural Information Processing Systems 30*, 2017.
- Dinh, L., Sohl-Dickstein, J., and Bengio, S. [“Density Estimation Using Real NVP.”](https://arxiv.org/abs/1605.08803) *International Conference on Learning Representations*, 2017.
- Kingma, D. P., and Dhariwal, P. [“Glow: Generative Flow with Invertible 1x1 Convolutions.”](https://proceedings.neurips.cc/paper_files/paper/2018/hash/d139db6a236200b21cc7f752979132d0-Abstract.html) *Advances in Neural Information Processing Systems 31*, 2018.
- Karras, T., Laine, S., and Aila, T. [“A Style-Based Generator Architecture for Generative Adversarial Networks.”](https://openaccess.thecvf.com/content_CVPR_2019/html/Karras_A_Style-Based_Generator_Architecture_for_Generative_Adversarial_Networks_CVPR_2019_paper) *Proceedings of the IEEE/CVF Conference on Computer Vision and Pattern Recognition*, 4401–4410, 2019.
- Sohl-Dickstein, J., Weiss, E., Maheswaranathan, N., and Ganguli, S. [“Deep Unsupervised Learning Using Nonequilibrium Thermodynamics.”](https://proceedings.mlr.press/v37/sohl-dickstein15.html) *Proceedings of the 32nd International Conference on Machine Learning*, 2256–2265, 2015.
- Ho, J., Jain, A. N., and Abbeel, P. [“Denoising Diffusion Probabilistic Models.”](https://proceedings.neurips.cc/paper/2020/hash/4c5bcfec8584af0d967f1ab10179ca4b-Abstract.html) *Advances in Neural Information Processing Systems 33*, 6840–6851, 2020.
- Song, Y., Sohl-Dickstein, J., Kingma, D. P., Kumar, A., Ermon, S., and Poole, B. [“Score-Based Generative Modeling through Stochastic Differential Equations.”](https://arxiv.org/abs/2011.13456) *International Conference on Learning Representations*, 2021.
- Rombach, R., Blattmann, A., Lorenz, D., Esser, P., and Ommer, B. [“High-Resolution Image Synthesis with Latent Diffusion Models.”](https://openaccess.thecvf.com/content/CVPR2022/html/Rombach_High-Resolution_Image_Synthesis_With_Latent_Diffusion_Models_CVPR_2022_paper.html) *Proceedings of the IEEE/CVF Conference on Computer Vision and Pattern Recognition*, 10684–10695, 2022.
- Lipman, Y., Chen, R. T. Q., Ben-Hamu, H., Nickel, M., and Le, M. [“Flow Matching for Generative Modeling.”](https://arxiv.org/abs/2210.02747) *International Conference on Learning Representations*, 2023.
- Liu, X., Gong, C., and Liu, Q. [“Flow Straight and Fast: Learning to Generate and Transfer Data with Rectified Flow.”](https://arxiv.org/abs/2209.03003) *International Conference on Learning Representations*, 2023.
- Song, Y., Dhariwal, P., Chen, M., and Sutskever, I. [“Consistency Models.”](https://proceedings.mlr.press/v202/song23a.html) *Proceedings of the 40th International Conference on Machine Learning*, 32211–32252, 2023.
