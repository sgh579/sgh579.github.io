---
title: "统计学习方法笔记（一）"
date: 2026-07-21
excerpt: "这本书比较系统地介绍了多种基础的机器学习理论，是早些年的李航老师的一部经典作品，最早出版于2012年。虽然这本书的内容现在来看有很多过时和不准确的内容，但仍是一个较好的学习材料。"
lang: zh-CN
tags:
  - machine learning
---

![书中关于最大后验概率估计和结构风险最小化的说明，以及经验风险加正则化项的优化公式](/images/20260721-190011-structural-risk-minimization.png)

读到，贝叶斯估计中的最大后验估计可以写成结构风险最小化的形式。这里给出我的推导。

首先，结构风险写为：

$$
R_{srm} = \frac{1}{N}\sum_{i=1}^{N} L (y_i, f(x_i)) + \lambda J(f)
$$

规定一族有参数 \\(\theta\\) 标记的条件概率分布 \\(P_{\theta}(Y \mid X)\\)，用于描述给定输入 \\(X=x\\) 后，输出 \\(Y\\) 可能是什么值，以及每个值出现的概率。\\(\theta\\) 为模型参数。

数据为

$$
D = \{(x_1,y_1),(x_2,y_2), ... ,(x_N,y_N)\}
$$

最大后验估计（MAP）选择使后验概率最大的参数：

$$
\hat{\theta}_{MAP}
= \underset{\theta}{\operatorname{argmax}} P(\theta \mid D)
$$

（\\(P(\theta \mid D)\\) 为给定数据 \\(D\\) 时的参数 \\(\theta\\) 的后验概率。）

贝叶斯公式可以写为：

$$
P(\theta \mid D) = \frac{P(D \mid \theta)P(\theta)}{P(D)}
$$

\\(P(D)\\) 与 \\(\theta\\) 无关，因此：

$$
\hat{\theta}_{MAP}
= \underset{\theta}{\operatorname{argmax}} P(D \mid \theta)P(\theta)
$$

下面将数据似然展开。在给定输入 \\(x_1,\ldots,x_N\\) 和参数 \\(\theta\\) 后，假设各样本的输出条件独立，则

$$
\begin{aligned}
P(D \mid \theta)
&= P_{\theta}(y_1,\ldots,y_N \mid x_1,\ldots,x_N) \\
&= \prod_{i=1}^{N} P_{\theta}(y_i \mid x_i).
\end{aligned}
$$

将这个似然代回 MAP 目标：

$$
\hat{\theta}_{MAP}
= \underset{\theta}{\operatorname{argmax}}
\left[
\prod_{i=1}^{N} P_{\theta}(y_i \mid x_i)
\right]P(\theta).
$$

对数函数单调递增，因此最大化上式等价于最大化其对数。再取负号，就得到等价的最小化问题：

$$
\begin{aligned}
\hat{\theta}_{MAP}
&= \underset{\theta}{\operatorname{argmin}}
\left\{
-\log\left[
\prod_{i=1}^{N} P_{\theta}(y_i \mid x_i)
\right]
-\log P(\theta)
\right\} \\
&= \underset{\theta}{\operatorname{argmin}}
\left\{
-\sum_{i=1}^{N}\log P_{\theta}(y_i \mid x_i)
-\log P(\theta)
\right\}.
\end{aligned}
$$

将目标函数除以正数 \\(N\\) 不会改变最小值所对应的参数，所以

$$
\hat{\theta}_{MAP}
= \underset{\theta}{\operatorname{argmin}}
\left\{
\frac{1}{N}\sum_{i=1}^{N}
\left[-\log P_{\theta}(y_i \mid x_i)\right]
+ \frac{1}{N}\left[-\log P(\theta)\right]
\right\}.
$$

现在令预测模型为 \\(f_{\theta}\\)，并定义单个样本的负对数似然损失为

$$
L\bigl(y_i,f_{\theta}(x_i)\bigr)
= -\log P_{\theta}(y_i \mid x_i).
$$

再把参数先验所对应的惩罚项记为

$$
\lambda J(f_{\theta})
= \frac{1}{N}\left[-\log P(\theta)\right].
$$

等价地，这意味着先验分布可以写成

$$
P(\theta) \propto
\exp\left[-N\lambda J(f_{\theta})\right].
$$

于是 MAP 估计最终化为

$$
\boxed{
\hat{\theta}_{MAP}
= \underset{\theta}{\operatorname{argmin}}
\left[
\frac{1}{N}\sum_{i=1}^{N}
L\bigl(y_i,f_{\theta}(x_i)\bigr)
+ \lambda J(f_{\theta})
\right]
}.
$$

方括号中的第一项是经验风险，第二项是由参数先验诱导出的模型复杂度惩罚。因此，在上述条件独立假设和负对数似然损失定义下，最大后验估计可以写成结构风险最小化的形式。
